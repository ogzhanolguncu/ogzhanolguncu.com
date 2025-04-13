---
pubDatetime: 2025-04-15
title: "Implementing Distributed Counter: Part 1 - Node"
slug: implementing-distributed-counter-part-1
tags:
  - go
  - distributed
  - network_programming
description: "Learn how to build a distributed counter from scratch using Go and CRDT (Conflict-free Replicated Data Types)."
---

This is the second of a series of posts about implementing a distributed counter in Go.

- [Part 0: CRDT - Implementing a PNCounter](https://ogzhanolguncu.com/blog/implementing-distributed-counter-part-0/)
- **Part 1: Node - Structure and In-Memory Communication (You are here)**
- _Part 2: Networking - Peer Management and TCP Transport (Not yet published)_
- _Part 3: Finding Peers - The Discovery Service (Not yet published)_
- _Part 4: Adding Persistence - The Write-Ahead Log (WAL) (Not yet published)_
- _Part 5: Finishing Touches - API Gateway (Not yet published)_

Now that we've made sure we have a solid foundation, we can move on to our Node implementation where everything is glued together.

This part involves several components. Here's the directory structure we'll be working with:

```sh
part1/
 ├─ crdt/
 │   ├─ crdt.go
 │   ├─ crdt_test.go
 ├─ assertions/
 │   ├─ assertions.go
 ├─ node/
 │   ├─ node.go
 │   ├─ node_test.go
 │   ├─ peer.go
 ├─ protocol/
 │   ├─ message.go
 │   ├─ message_test.go
```

Before moving on, we have to make a brief detour and talk about something called DbC (Design by Contract). I'm not going to go into its details or history. To summarize it, we'll make assertions to ensure everything is as we expected. It's a great way to make sure your code is behaving as you instructed, and it's really helpful for spotting randomness in your code. More importantly, we have to catch those nasty issues before they cause serious damage.

Let's take a look at the assertion implementation

## DbC - Assertions

```go
// assertions/assertions.go
package assertions

import (
	"fmt"
	"runtime"
)

// Assert checks if the condition is true and panics with the given message if not.
// This function is meant to be removed in production builds.
func Assert(condition bool, msg string) {
	if !condition {
		_, file, line, _ := runtime.Caller(1)
		errorMsg := fmt.Sprintf("Assertion failed: %s\nFile: %s:%d", msg, file, line)
		panic(errorMsg)
	}
}

// AssertEqual checks if expected equals actual and panics with a message if not.
// This function is meant to be removed in production builds.
func AssertEqual(expected, actual any, msg string) {
	if expected != actual {
		_, file, line, _ := runtime.Caller(1)
		errorMsg := fmt.Sprintf("Assertion failed: %s\nExpected: %v, Got: %v\nFile: %s:%d",
			msg, expected, actual, file, line)
		panic(errorMsg)
	}
}

func AssertNotNil(value any, msg string) {
	if value == nil {
		_, file, line, _ := runtime.Caller(1)
		errorMsg := fmt.Sprintf("Assertion failed: %s\nExpected non-nil value\nFile: %s:%d",
			msg, file, line)
		panic(errorMsg)
	}
}
```

So if things go sideways our `assertions` will `panic` and crash our app then we'll know what to look for and fix it before it becomes catastrophic.

Example would be:

```go
	assertions.Assert(config.Addr != "", "node address cannot be empty")
```

In the future when we initialize our node and if there is no address, we can't proceed so there is no reason to keep running our code after this point. So we'll fail fast and early.

Now that is out of the way let's see how can we structure our protocol.

## Defining Our Communication Protocol

Having a well-defined protocol is crucial for any distributed application. When we say "protocol" here, we're not just talking about the underlying transport like TCP or UDP. It's a broader concept covering the entire "language" our nodes use to speak to each other. It dictates:

```
┌───────────────────────────────────────────┐
│ PROTOCOL COMPONENTS:                      │
│                                           │
│ ► Message structure and framing           │
│ ► Encoding and decoding rules             │
│ ► Compression strategies                  │
│ ► Communication semantics (the meaning)   │
└───────────────────────────────────────────┘
```

Take RESP (Redis Serialization Protocol), RESP doesn't just define message formats; it specifies the complete interaction model for Redis components. Our goal is similar: create a clear, shared language for our counter nodes. This ensures they understand each other perfectly and communicate with minimal wasted effort (overhead).

Let's see how our protocol works using a LEGO analogy.

**Shipping LEGOs**

Imagine our nodes are like LEGO master builders spread across different cities, all collaborating to build **identical, complex** models (representing our distributed counter's state) **without directly seeing each other's work**. They need a reliable system to share updates and make sure everyone's model eventually matches perfectly. Our `protocol` package defines the strict rules for how they **package and ship** these LEGO updates:

1.  **The LEGO Model (`Message` struct):** The blueprint for every package. Includes:

    - `Type`: What kind of update is this?
    - `NodeID`: A sticker identifying the builder.
    - `Increment/DecrementValues`: The actual LEGO bricks (counter data), only in `Push` packages.
    - `Digest`: A tiny, unique photo (a calculated number/fingerprint) representing the _entire_ current model. Identical models always get the same photo.

2.  **Types of Packages (Message Types):**

    - `Push`: The **big box containing the full LEGO model** (bricks). Shares the complete state.
    - `DigestPull`: Sends **only a postcard with the photo** (`Digest`). Asks, "My model photo looks like this. Does yours match, or do you have updates?"
    - `DigestAck`: Also sends **just the photo** (`Digest`). Confirms, "Yep, recognized that photo!" indicating sync/acknowledgment.

3.  **Boxing it Up (`encode` / `msgpack`):** Neatly boxing the `Message` structure into bytes using `msgpack`.

4.  **Shrinking Big Boxes (`compress` / `zstd`):** If the box is large, use `zstd` (like a vacuum sealer) to compress it, adding a flag.

5.  **Unboxing (`decode` / `msgpack` / `zstd`):** When a package arrives, the receiver **first checks** the compression flag. If needed, they un-squish it (`zstd`), then carefully unbox (`msgpack`) back to the `Message` structure.

6.  **Why the Photo? (The `Digest`):** Shipping the **entire, potentially huge box of LEGO bricks** (`Push`) constantly is inefficient. Sending just the tiny photo (`Digest`) via postcard (`DigestPull`/`DigestAck`) is much faster for checking if models match. If photos differ, _then_ maybe the big box (`Push`) is needed.

7.  **Quality Control (`validate`):** Checking the package before sending and after receiving to ensure it's not broken or nonsensical.

---

**Message Framing**

When a message is actually sent, the very first byte tells us if the payload (the boxed LEGO model) is compressed:

```
┌───────────────────────────────────────────────────────────────────────┐
│                      MESSAGE FRAME STRUCTURE                          │
├───────────┬───────────────────────────────────────────────────────────┤
│ COMP FLAG │                   MESSAGE PAYLOAD                         │
│  (1 byte) │      (MessagePack encoded, optionally compressed)         │
├───────────┼───────────────────────────────────────────────────────────┤
│   0x00    │ Uncompressed MessagePack data                             │
│   0x80    │ Compressed MessagePack data using zstd                    │
└───────────┴───────────────────────────────────────────────────────────┘
```

This simple flag allows the receiving node to immediately know if decompression is needed _before_ trying to decode the main payload.

**Why Compression?**

In a gossip cluster with many nodes (aiming for Availability and Partition Tolerance - AP - in CAP), nodes frequently exchange state. Without compression, sending full CRDT maps between, say, 100 nodes could quickly lead to network congestion. We only compress messages larger than a set threshold (`CompressionThreshold`), balancing CPU cost (for compression) against network savings.

**Why `msgpack`?**

We use `msgpack` for "boxing up" our `Message` struct. Why? It generally offers a good balance:

- Faster encoding/decoding than standard `JSON` or `gob`.
- Produces reasonably compact binary data.
- Slightly slower than `protobuf`, but often simpler to integrate initially (At least for me).

> **Note:** To use `msgpack`, you'll need to install it: `go get "github.com/vmihailenco/msgpack/v5"` and to use `zstd`, `go get "github.com/klauspost/compress/zstd"`
>
> For production systems that require performance consider using `protobuf`.

**Message Structure:**

This table shows the fields within the message payload (after potential decompression and `msgpack` decoding), mapping directly to our LEGO analogy:

```
┌────────────────────────────────────────────────────────────────────┐
│                       MESSAGE STRUCTURE                            │
├──────────┬──────────┬─────────────────┬─────────────────┬──────────┤
│   TYPE   │ NODE ID  │ INCREMENT VALUES│ DECREMENT VALUES│  DIGEST  │
│ (1 byte) │ (string) │    (PNMap)      │     (PNMap)     │ (uint64) │
│ (Kind)   │ (Builder)│    (Bricks)     │     (Bricks)    │  (Photo) │
├──────────┼──────────┼─────────────────┼─────────────────┼──────────┤
│   0x01   │     ✓    │        ✓        │        ✓        │    ✗     │ Push Message (Full Model)
│   0x02   │     ✓    │        ✗        │        ✗        │    ✓     │ Digest Pull (Ask w/ Photo)
│   0x03   │     ✓    │        ✗        │        ✗        │    ✓     │ Digest Ack (Confirm w/ Photo)
└──────────┴──────────┴─────────────────┴─────────────────┴──────────┘
```

As you can see, our protocol defines three essential message types (`Push`, `DigestPull`, `DigestAck`) that allow nodes to efficiently synchronize the distributed counter state, using digests and optional compression to keep network overhead low.

Enough stories! Let's see the actual implementation now.

Let's define our `Message` struct, flags and error messages.

```go
const (
    MessageTypePush       = 0x01
    MessageTypeDigestPull = 0x02 // Request with just a digest
    MessageTypeDigestAck  = 0x03 // Acknowledgment when digests match
    MessageFlagCompressed = 0x80

    CompressionThreshold = 1 << 10    // Only compress message larger than this (Bytes)
    DefaultBufferSize    = 1 << 12    // 4KB buffer
    MaxMessageSize       = 10 << 20   // 10MB max message size, adjust this if needed
)

var (
	ErrEmptyMessage     = errors.New("protocol: empty message data")
	ErrDecompression    = errors.New("protocol: failed to decompress data")
	ErrUnmarshall       = errors.New("protocol: failed to decode message")
	ErrInvalidType      = errors.New("protocol: invalid message type")
	ErrMessageTooLarge  = errors.New("protocol: message exceeds maximum size")
	ErrEmptyNodeID      = errors.New("protocol: empty node ID")
	ErrEmptyPNMaps      = errors.New("protocol: push message must contain increment or decrement values")
	ErrValidationFailed = errors.New("protocol: message validation failed")
	ErrEncodingFailed   = errors.New("protocol: message encoding failed")
)

// Message represents a protocol message for PNCounter CRDT
type Message struct {
	Type            uint8      `msgpack:"t"`
	NodeID          string     `msgpack:"id"`
	IncrementValues crdt.PNMap `msgpack:"inc"`
	DecrementValues crdt.PNMap `msgpack:"dec"`
	Digest          uint64     `msgpack:"dig,omitempty"` // xxHash digest of state
}
```

**Let's define our `validate`.**

```go
// Validate checks if the message is valid
func (m *Message) validate() error {
	assertions.Assert(m != nil, "Message cannot be nil")
	// Check message type is valid
	if m.Type != MessageTypePush && m.Type != MessageTypeDigestAck && m.Type != MessageTypeDigestPull {
		return ErrInvalidType
	}

	// Node ID must not be empty
	if m.NodeID == "" {
		return ErrEmptyNodeID
	}

	// For push messages, either increment or decrement values should be present
	if m.Type == MessageTypePush && len(m.IncrementValues) == 0 && len(m.DecrementValues) == 0 {
		return ErrEmptyPNMaps
	}

	return nil
}
```

**Now that we know we can safely `encode` and `decode` let's see those in action.**

```go
// encode validates, marshals, checks size, and optionally compresses the message.
// Returns an error if validation fails, marshalling fails, or message exceeds MaxMessageSize.
func (m *Message) encode() ([]byte, error) { // <<< Changed signature: returns ([]byte, error)
	// Validate the message before encoding
	if err := m.validate(); err != nil {
		return nil, fmt.Errorf("%w: %v", ErrValidationFailed, err)
	}

	data, err := msgpack.Marshal(m)
	if err != nil {
		// Return marshalling error explicitly
		return nil, fmt.Errorf("%w: %v", ErrEncodingFailed, err)
	}

	// Check size *after* marshalling but *before* compression attempt
	if len(data) > MaxMessageSize {
		// Return specific error for oversized messages
		return nil, fmt.Errorf("%w: message size %d exceeds limit %d",
			ErrMessageTooLarge, len(data), MaxMessageSize)
	}

	// Attempt compression only if beneficial and above threshold
	if len(data) > CompressionThreshold {
		compressedData, errCompress := compressData(data)
		// Only use compressed data if compression succeeded AND it's actually smaller
		if errCompress == nil && len(compressedData) < len(data) {
			// Allocate result slice: 1 byte for header + compressed data length
			result := make([]byte, 1+len(compressedData))
			result[0] = MessageFlagCompressed // Set compression flag
			copy(result[1:], compressedData)
			return result, nil
		}
		// If compression failed or wasn't smaller, fall through to send uncompressed
	}

	// Handle uncompressed data (either below threshold or compression not beneficial)
	// Allocate result slice: 1 byte for header + uncompressed data length
	result := make([]byte, 1+len(data))
	result[0] = 0 // No compression flag (explicitly zero)
	copy(result[1:], data)
	return result, nil
}
```

The `encode` method first validates the message. If valid, it proceeds to encode the message. Right after encoding, it checks if the resulting byte slice `data` exceeds the predefined `MaxMessageSize`. If it does, the function stops processing and prevents oversized messages from proceeding.

> **Why Limit Message Size?**
>
> There are several **reasons** for this limit, which should be **adjusted** based on the system's needs:
>
> - **Network Stability:** For better network stability, we don't **want to** overwhelm or congest the network buffers.
> - **Predictability:** It helps keep message processing times somewhat predictable.
> - **Resource Protection:** It prevents nodes from crashing due to Out Of Memory errors when processing huge messages.
> - **Security:** There are also security reasons, like preventing Denial-of-Service (DoS) attacks where an attacker could try to overwhelm nodes with huge payloads. Preventing a node from crashing helps protect overall cluster stability.
>
> So, as you can see, **it's** a **fail-safe** mechanism.

After the size check passes, the code determines if the payload should be compressed. It checks if the payload size is greater than `CompressionThreshold`. If it is, _and_ compressing is successful _and_ results in a smaller size, then the `MessageFlagCompressed` byte (0x80) is prepended to the compressed data.

Even if the message doesn't require compression (because it's below the threshold, or compression didn't make it smaller), we still prepend a 1-byte header – in this case, a byte with the value 0x00.

The `decode` is quite similar to `encode`.

```go
// decode deserializes a byte slice into this Message
func (m *Message) decode(data []byte) error {
	assertions.AssertNotNil(data, "Data cannot be nil")
	// Check for empty message (at least 1 byte needed for header)
	if len(data) == 0 {
		return ErrEmptyMessage
	}

	// Check maximum message size (applied to the raw incoming data)
	if len(data) > MaxMessageSize {
		// Use existing ErrMessageTooLarge, potentially adding context
		return fmt.Errorf("%w: received message size %d exceeds limit %d",
			ErrMessageTooLarge, len(data), MaxMessageSize)
	}

	// Process message based on compression flag
	var payload []byte
	isCompressed := data[0] == MessageFlagCompressed
	if isCompressed {
		// Ensure there's data *after* the flag
		if len(data) < 2 {
			return fmt.Errorf("%w: compressed message has no payload", ErrEmptyMessage)
		}
		decompressed, err := decompressData(data[1:])
		if err != nil {
			// Wrap ErrDecompression for more context
			return fmt.Errorf("%w: %v", ErrDecompression, err)
		}
		payload = decompressed
	} else {
		// Ensure there's data *after* the flag (or it's just the flag byte)
		if len(data) < 2 {
			// Allow single byte '0x00' if that's a valid (empty) uncompressed message semantic,
			// otherwise return ErrEmptyMessage or similar if payload is always expected.
			// Assuming here payload IS expected after the 0x00 flag.
			return fmt.Errorf("%w: uncompressed message has no payload", ErrEmptyMessage)
		}
		payload = data[1:]
	}

	// Unmarshal the MessagePack data from the payload
	err := msgpack.Unmarshal(payload, m)
	if err != nil {
		// Wrap ErrUnmarshall
		return fmt.Errorf("%w: %v", ErrUnmarshall, err)
	}

	// Validate the logical content of the decoded message
	if err := m.validate(); err != nil {
		// Return validation error directly (e.g., ErrInvalidType, ErrEmptyNodeID)
		return err
	}

	return nil
}
```

The `decode` function begins by checking if the input data is present. If data exists, it reads the first byte to check the compression flag. Finally, it unmarshals the payload and calls validate to confirm the message's contents are logically correct and carry what we need.

Let's expose those helpers to outside.

```go
// Decode is a helper function to decode data into a new Message struct
func Decode(data []byte) (*Message, error) {
	msg := &Message{}
	// Use the updated decode method which handles errors
	err := msg.decode(data)
	if err != nil {
		return nil, err // Propagate errors from decode
	}
	return msg, nil
}

// Encode is a helper function to encode a Message struct into bytes
func Encode(msg Message) ([]byte, error) {
	assertions.Assert(msg.Type != 0, "Message type cannot be zero")
	assertions.Assert(msg.NodeID != "", "Node ID cannot be empty")
	assertions.Assert(msg.Type == MessageTypePush || msg.Type == MessageTypeDigestAck || msg.Type == MessageTypeDigestPull,
		"Message type must be valid")
	if msg.Type == MessageTypePush {
		assertions.Assert(len(msg.IncrementValues) > 0 || len(msg.DecrementValues) > 0,
			"Push message must contain increment or decrement values")
	}

	data, err := msg.encode()
	if err != nil {
		return nil, err
	}
	return data, nil
}
```

Let's quickly add our compression helpers too.

```go
func compressData(data []byte) ([]byte, error) {
	assertions.AssertNotNil(data, "Input data cannot be nil")

	encoder, err := zstd.NewWriter(nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create zstd writer: %w", err)
	}
	compressed := encoder.EncodeAll(data, make([]byte, 0, len(data)/2)) // Pre-allocate roughly
	errClose := encoder.Close()
	if errClose != nil {
		return nil, fmt.Errorf("failed to close zstd writer: %w", errClose)
	}

	return compressed, nil
}

func decompressData(data []byte) ([]byte, error) {
	assertions.AssertNotNil(data, "Compressed data cannot be nil")
	if len(data) == 0 {
		return []byte{}, nil // Decompressing empty results in empty
	}

	decoder, err := zstd.NewReader(nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create zstd reader: %w", err)
	}
	defer decoder.Close() // Ensure decoder resources are released

	// DecodeAll handles allocation. Let's estimate output size if possible, otherwise start empty.
	// Rough estimation: assume compression ratio ~3x if known, otherwise start small.
	output, err := decoder.DecodeAll(data, make([]byte, 0, len(data)*2)) // Pre-allocate estimate
	if err != nil {
		return nil, fmt.Errorf("failed to decode zstd data: %w", err)
	}
	return output, nil
}
```

And, let's define our `Transport` interface.

```go
type Transport interface {
	// Send sends data to the specified address
	Send(addr string, data []byte) error
	// Listen registers a handler for incoming messages
	Listen(handler func(addr string, data []byte) error) error
	// Close closes the transport
	Close() error
}
```

The reason for this interface is actually twofold: in this part, we'll test our node in-memory because we want to decouple it from the network for deterministic testing. And, in the future, we might want to swap TCP with UDP or something else, so this interface gives us that flexibility.

Let's add some tests for our protocol package:

```go
// message_test.go
package protocol

import (
	"testing"

	"github.com/ogzhanolguncu/distributed-counter/part1/crdt"
	"github.com/stretchr/testify/require"
)

func TestMessageValidation(t *testing.T) {
	tests := []struct {
		name        string
		message     Message
		expectError bool
		errorType   error
	}{
		{
			name: "Valid push message",
			message: Message{
				Type:            MessageTypePush,
				NodeID:          "node1",
				IncrementValues: crdt.PNMap{"key1": 1},
			},
			expectError: false,
		},
		{
			name: "Invalid message type",
			message: Message{
				Type:   0xFF,
				NodeID: "node1",
			},
			expectError: true,
			errorType:   ErrInvalidType,
		},
		{
			name: "Empty node ID",
			message: Message{
				Type:   MessageTypePush,
				NodeID: "",
			},
			expectError: true,
			errorType:   ErrEmptyNodeID,
		},
		{
			name: "Push message with no values",
			message: Message{
				Type:            MessageTypePush,
				NodeID:          "node1",
				IncrementValues: make(crdt.PNMap),
				DecrementValues: make(crdt.PNMap),
			},
			errorType:   ErrEmptyPNMaps,
			expectError: true,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			err := tc.message.validate()

			if tc.expectError {
				require.Error(t, err)
				if tc.errorType != nil {
					require.ErrorIs(t, err, tc.errorType)
				}
			} else {
				require.NoError(t, err)
			}
		})
	}
}

func TestCriticalEdgeCases(t *testing.T) {
	t.Run("Empty data decoding", func(t *testing.T) {
		_, err := Decode([]byte{})
		require.Error(t, err)
		require.ErrorIs(t, err, ErrEmptyMessage)
	})

	t.Run("Invalid msgpack data", func(t *testing.T) {
		// Create invalid msgpack data with correct header
		invalidData := []byte{0x00, 0xFF, 0xFF, 0xFF} // First byte is compression flag (none)

		_, err := Decode(invalidData)
		require.Error(t, err)
		require.Contains(t, err.Error(), ErrUnmarshall.Error())
	})
}

func TestCompressionAndEncodeDecode(t *testing.T) {
	// Create a message that should exceed compression threshold
	largeMap := make(crdt.PNMap)
	for i := range 20 {
		key := "key" + string(rune('A'+i))
		largeMap[key] = uint64(i * 100)
	}

	message := Message{
		Type:            MessageTypePush,
		NodeID:          "compression-test-node",
		IncrementValues: largeMap,
	}

	// Encode and check if compressed
	encoded, err := Encode(message)
	require.NoError(t, err)

	isCompressed := encoded[0] == MessageFlagCompressed
	t.Logf("Message compressed: %v", isCompressed)

	// Decode and verify content matches regardless of compression
	decoded, err := Decode(encoded)
	require.NoError(t, err)
	require.Equal(t, message.Type, decoded.Type)
	require.Equal(t, message.NodeID, decoded.NodeID)
	require.Equal(t, message.IncrementValues, decoded.IncrementValues)
}
```

## Node

It's time to put everything together, but we have to discuss a couple of things first. In this current part (Part 1), our node will be completely static. What does that mean? Meaning our nodes have to receive peer addresses manually – we'll address dynamic discovery in Part 3, but for now, for the sake of simplicity, we'll keep it as straightforward as possible.

Let's define our structs.

```go
// node/node.go
package node

import (
	"context"
	"fmt"
	"log/slog"
	"math/rand/v2"
	"os"
	"sort"
	"time"

	"github.com/cespare/xxhash/v2"
	"github.com/ogzhanolguncu/distributed-counter/part1/assertions"
	"github.com/ogzhanolguncu/distributed-counter/part1/crdt"
	"github.com/ogzhanolguncu/distributed-counter/part1/protocol"
	"github.com/vmihailenco/msgpack/v5"
	"golang.org/x/sync/errgroup"
)

const defaultChannelBuffer = 10_000

type Config struct {
	Addr             string
	MaxSyncPeers     int
	SyncInterval     time.Duration
	FullSyncInterval time.Duration
	LogLevel         slog.Level
}

type MessageInfo struct {
	message protocol.Message
	addr    string // Address message was received from OR is destined for
}

type Node struct {
	config  Config
	counter *crdt.PNCounter // Holds the actual CRDT state
	logger  *slog.Logger

	transport protocol.Transport // Interface for network communication
	ctx       context.Context    // For cancellation and graceful shutdown
	cancel    context.CancelFunc

	peers *Peer // Manages the list of known peer addresses

	// Channels for decoupled message handling
	incomingMsg  chan MessageInfo
	outgoingMsg  chan MessageInfo

	// Tickers for periodic tasks
	syncTick     <-chan time.Time // Triggers regular digest syncs
	fullSyncTick <-chan time.Time // Triggers less frequent full state syncs
}
```

- `Config`: Holds bootstrap configuration parameters for the node.
- `MessageInfo`: Wraps a `protocol.Message` with its relevant peer address (either source or destination).
  The `Node` struct itself holds the core state and components: the CRDT `counter`, `logger`, `transport`, `peers` list, plus concurrency primitives like `ctx` for cancellation, `incomingMsg`/`outgoingMsg` channels for decoupled communication, and tickers (`syncTick`, `fullSyncTick`) for periodic synchronization tasks.

While we're at it, let's create our simple peer management helper.

### Peer Management

```go
// node/peer.go
package node

import (
	"sync"

	"github.com/ogzhanolguncu/distributed-counter/part1/assertions"
)

type Peer struct {
	peers   []string
	peersMu sync.RWMutex
}

func NewPeer() *Peer {
	return &Peer{
		peers:   make([]string, 0),
		peersMu: sync.RWMutex{},
	}
}

func (p *Peer) SetPeers(peers []string) {
	assertions.Assert(len(peers) > 0, "arg peers cannot be empty")

	p.peersMu.Lock()
	defer p.peersMu.Unlock()
	p.peers = make([]string, len(peers))
	copy(p.peers, peers)

	assertions.AssertEqual(len(p.peers), len(peers), "node's peers should be equal to peers")
}

func (p *Peer) GetPeers() []string {
	p.peersMu.RLock()
	defer p.peersMu.RUnlock()
	peers := make([]string, len(p.peers))
	copy(peers, p.peers)
	return peers
}
```

These methods are straightforward thread-safe getters and setters for our static peer list. We'll build more sophisticated peer management later in the series, but this suffices for now.

Let's create our node constructor.

```go
func NewNode(config Config, transport protocol.Transport) (*Node, error) {
	ctx, cancel := context.WithCancel(context.Background())

	assertions.Assert(config.SyncInterval > 0, "sync interval must be positive")
	assertions.Assert(config.MaxSyncPeers > 0, "max sync peers must be positive")
	assertions.Assert(config.Addr != "", "node address cannot be empty")
	assertions.AssertNotNil(transport, "transport cannot be nil")

	if config.FullSyncInterval == 0 {
		config.FullSyncInterval = config.SyncInterval * 10 // Default to 10x regular sync interval
	}

	logger := slog.New(slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{
		Level: config.LogLevel,
	})).With("[NODE]", config.Addr)

	node := &Node{
		config:    config,
		counter:   crdt.New(config.Addr),
		logger:    logger,
		peers:     NewPeer(),
		ctx:       ctx,
		cancel:    cancel,
		transport: transport,

		incomingMsg:  make(chan MessageInfo, defaultChannelBuffer),
		outgoingMsg:  make(chan MessageInfo, defaultChannelBuffer),
		syncTick:     time.NewTicker(config.SyncInterval).C,
		fullSyncTick: time.NewTicker(config.FullSyncInterval).C, // Initialize full sync ticker
	}

	assertions.AssertNotNil(node.counter, "node counter must be initialized")
	assertions.AssertNotNil(node.ctx, "node context must be initialized")
	assertions.AssertNotNil(node.cancel, "node cancel function must be initialized")

	if err := node.startTransport(); err != nil {
		cancel() // Clean up if we fail to start
		return nil, err
	}

	go node.eventLoop()
	return node, nil
}
```

The `NewNode` constructor initializes the node's core components based on the provided `config` and `transport`. Key responsibilities include setting up the logger, initializing the CRDT counter and peer list, creating the context for graceful shutdown, initializing communication channels and sync tickers. Crucially, it calls `startTransport` to begin listening for incoming messages non-blockingly and launches the main `eventLoop` in a separate goroutine to handle processing. Assertions (DbC) are used throughout to validate configuration and initialization steps.

Now let's jump into the `startTransport` method.

```go
func (n *Node) startTransport() error {
	err := n.transport.Listen(func(addr string, data []byte) error {
		assertions.Assert(addr != "", "incoming addr cannot be empty")
		assertions.AssertNotNil(data, "incoming data cannot be nil or empty")

		msg, err := protocol.Decode(data)
		if err != nil {
			n.logger.Error("failed to decode incoming message",
				"node", n.config.Addr,
				"from", addr,
				"error", err)
			return fmt.Errorf("failed to read message: %w", err)
		}
		select {
		case n.incomingMsg <- MessageInfo{message: *msg, addr: addr}:
			// Message queued successfully
		default:
			n.logger.Warn("dropping incoming message, channel is full",
				"node", n.config.Addr,
				"from", addr,
				"message_type", msg.Type)
		}
		return nil
	})
	if err != nil {
		return fmt.Errorf("failed to start transport listener: %w", err)
	}

	return nil
}
```

The `startTransport` method sets up the listener via the `Transport` interface. The key pattern here is the callback function passed to `Listen`: it receives raw data from a peer (`addr`, `data`), decodes it using `protocol.Decode`, and then uses a non-blocking send (`select`/`default`) to queue the resulting `MessageInfo` onto the `incomingMsg` channel. This decouples network reads from the main processing logic and prevents the listener goroutine from blocking if the `eventLoop` is temporarily busy processing other events, ensuring network responsiveness. Errors during decoding are logged (but don't stop the listener), and full channel scenarios result in dropped messages with a warning.

Let's take a closer look at the `eventLoop`, the heart of our node.

```sh
┌────────────────── EVENT LOOP ──────────────────┐
│                                                │
│   ctx.Done ─────────────► shutdown             │
│                                                │
│   incomingMsg ────────────► handleIncMsg       │
│      ▲                       │                 │
│      │                       │                 │
│   Transport.Listen           │                 │
│      ▲                       ▼                 │
│      │                   outgoingMsg           │
│      │                       │                 │
│   [Peers]                    │                 │
│      │                       ▼                 │
│      └───────────────── Transport.Send         │
│                              │                 │
│   syncTick ───────────────► initiateDigestSync │
│                              │                 │
│                              ▼                 │
│                          outgoingMsg           │
│                              │                 │
│                              ▼                 │
│                          Transport.Send        │
│                                                │
│   fullSyncTick ───────────► performFullSync    │
│                              │                 │
│                              ▼                 │
│                          outgoingMsg           │
│                              │                 │
│                              ▼                 │
│                          Transport.Send        │
│                                                │
└────────────────────────────────────────────────┘
```

```go
func (n *Node) eventLoop() {
	for {
		select {
		case <-n.ctx.Done():
			n.logCounterState("node shutting down")
			return

		case msg := <-n.incomingMsg:
			n.handleIncMsg(msg)

		case msg := <-n.outgoingMsg:
			assertions.Assert(msg.addr != "", "outgoing addr cannot be empty")
			data, err := protocol.Encode(msg.message)
			if err != nil {
				n.logger.Error("failed to encode outgoing message",
					"node", n.config.Addr,
					"target", msg.addr,
					"message_type", msg.message.Type,
					"error", err)
				continue
			}

			if err := n.transport.Send(msg.addr, data); err != nil {
				n.logger.Error("failed to send message",
					"node", n.config.Addr,
					"target", msg.addr,
					"message_type", msg.message.Type,
					"error", err)
			}

		case <-n.syncTick:
			n.initiateDigestSync()
		case <-n.fullSyncTick:
			n.performFullStateSync()
		}
	}
}
```

This `eventLoop` acts as the node's central coordinator, running continuously until shutdown. It uses a `select` statement to wait concurrently on multiple channel events:

- `<-n.ctx.Done()`: Listens for the context cancellation signal to initiate a graceful shutdown, logging the final counter state.
- `<-n.incomingMsg`: Receives messages decoded and queued by `startTransport`. It delegates the processing of these messages to the `handleIncMsg` method (which we'll detail later).
- `<-n.outgoingMsg`: Processes messages that need to be sent to other peers. It takes a `MessageInfo` from the channel, encodes it using `protocol.Encode`, and sends the resulting bytes via `n.transport.Send`, logging any encoding or send errors.
- `<-n.syncTick`: Triggered periodically based on `config.SyncInterval`. It calls `initiateDigestSync` to start a regular state synchronization process (details to come).
- `<-n.fullSyncTick`: Triggered less frequently based on `config.FullSyncInterval`. It calls `performFullStateSync` for a more comprehensive state exchange (details to come).
