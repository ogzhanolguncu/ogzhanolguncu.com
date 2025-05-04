---
pubDatetime: 2025-04-14
title: "Implementing Distributed Counter: Part 1 - Node"
slug: implementing-distributed-counter-part-1
tags:
  - go
  - distributed
  - network_programming
description: Learn how to implement the core Node component of a distributed counter in Go. This part details the Node structure, defines the communication protocol, integrates the CRDT, and implements synchronization tested via in-memory transport.
---

This is the second in a series of posts about implementing a distributed counter in Go.

- [Part 0: CRDT - Implementing a PNCounter](https://ogzhanolguncu.com/blog/implementing-distributed-counter-part-0/)
- [Part 1: Node - Structure and In-Memory Communication](https://ogzhanolguncu.com/blog/implementing-distributed-counter-part-1/) **(You are here)**
- _Part 2: Networking - Peer Management and TCP Transport (Not yet published)_
- _Part 3: Finding Peers - The Discovery Service (Not yet published)_
- _Part 4: Adding Persistence - The Write-Ahead Log (WAL) (Not yet published)_
- _Part 5: Finishing Touches - API Gateway (Not yet published)_

## Part 1 Goal

Our main goal now for Part 1 is to implement the Node in Go. The Node will connect everything from CRDT to network using our own protocol. Part 1's Node will have a static list of peers for the sake of simplicity, but later in the series we'll add proper peer discovery. So our goal is to get up and running and see our CRDT in action.

---

Now that we've made sure we have a solid foundation, we can move on to our Node implementation where everything is glued together.

This part involves several components. Here's the directory structure we'll be working with:

```
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

In the future, when we initialize our node and if there is no address, we can't proceed, so there is no reason to keep running our code after this point. So we'll fail fast and early.

Now that that is out of the way, let's see how we can structure our protocol

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

Take RESP (Redis Serialization Protocol), RESP doesn't just define message formats; it specifies the complete interaction model for Redis components. Our goal is similar: create a clear, shared language for our counter nodes. This ensures they understand each other perfectly and communicate with minimal overhead.

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

Let's define our `validate`.

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

Now that we know we can safely `encode` and `decode` let's see those in action.

```go
// encode validates, marshals, checks size, and optionally compresses the message.
// Returns an error if validation fails, marshalling fails, or message exceeds MaxMessageSize.
func (m *Message) encode() ([]byte, error) {
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

	// Check maximum message size
	if len(data) > MaxMessageSize {
		// Use existing ErrMessageTooLarge, potentially adding context
		return fmt.Errorf("%w: received message size %d exceeds limit %d",
			ErrMessageTooLarge, len(data), MaxMessageSize)
	}

	// Process message based on compression flag
	var payload []byte
	isCompressed := data[0] == MessageFlagCompressed
	if isCompressed {
		// Ensure there's data after the flag
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
		// Ensure there's data after the flag (or it's just the flag byte)
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
		fullSyncTick: time.NewTicker(config.FullSyncInterval).C,
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

The `NewNode` constructor initializes the node's core components based on the provided `config` and `transport`. It calls `startTransport` to begin listening for incoming messages non-blockingly and launches the main `eventLoop` in a separate goroutine to handle processing. Assertions (DbC) are used throughout to validate configuration and initialization steps.

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

The `startTransport` method sets up the listener via the `Transport` interface. The key pattern here is the callback function passed to `Listen`: it receives raw data from a peer (`addr`, `data`), decodes it using `protocol.Decode`, and then uses a non-blocking send (`select`/`default`) to queue the resulting `MessageInfo` onto the `incomingMsg` channel. This decouples network reads from the main processing logic and prevents the listener goroutine from blocking if the `eventLoop` is temporarily busy processing other events. Errors during decoding are logged (but don't stop the listener), and full channel scenarios result in dropped messages with a warning.

Let's take a closer look at the `eventLoop`, the heart of our node.

```
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

Let's take a look at our helpers before moving on to `handleIncMsg` or any other method in our `eventLoop`.

```go
// Create a message with the current counter state
func (n *Node) prepareCounterMessage(msgType uint8) protocol.Message {
	// Get both increment and decrement counters
	increments, decrements := n.counter.Counters()

	return protocol.Message{
		Type:            msgType,
		NodeID:          n.config.Addr,
		IncrementValues: increments,
		DecrementValues: decrements,
	}
}

func (n *Node) prepareDigestMessage(msgType uint8, digestValue ...uint64) protocol.Message {
	// Base message with common fields
	msg := protocol.Message{
		Type:   msgType,
		NodeID: n.config.Addr,
	}

	// If it's a digest pull or digest ack, set the digest
	if msgType == protocol.MessageTypeDigestPull || msgType == protocol.MessageTypeDigestAck {
		// For digest pull, calculate our current digest
		if msgType == protocol.MessageTypeDigestPull || len(digestValue) == 0 {
			// Get both increment and decrement counters
			increments, decrements := n.counter.Counters()
			data, err := deterministicSerialize(increments, decrements)
			if err != nil {
				n.logger.Error("failed to create digest message",
					"node", n.config.Addr,
					"message_type", msgType,
					"error", err)
				return msg
			}

			msg.Digest = xxhash.Sum64(data)
		} else {
			// For digest ack, use the provided digest value
			msg.Digest = digestValue[0]
		}
	}

	return msg
}


type CounterEntry struct {
	NodeID string
	Value  uint64
}

func deterministicSerialize(increments, decrements crdt.PNMap) ([]byte, error) {
	// Combine all keys from both maps to get the complete set of node IDs
	allNodeIDs := make(map[string]struct{})
	for nodeID := range increments {
		allNodeIDs[nodeID] = struct{}{}
	}
	for nodeID := range decrements {
		allNodeIDs[nodeID] = struct{}{}
	}

	// Create a sorted slice of all node IDs
	sortedNodeIDs := make([]string, 0, len(allNodeIDs))
	for nodeID := range allNodeIDs {
		sortedNodeIDs = append(sortedNodeIDs, nodeID)
	}
	sort.Strings(sortedNodeIDs)

	orderedIncrements := make([]CounterEntry, len(sortedNodeIDs))
	orderedDecrements := make([]CounterEntry, len(sortedNodeIDs))

	for i, nodeID := range sortedNodeIDs {
		// Use the value if it exists, or 0 if it doesn't
		incValue := increments[nodeID] // Will be 0 if key doesn't exist
		decValue := decrements[nodeID] // Will be 0 if key doesn't exist

		orderedIncrements[i] = CounterEntry{NodeID: nodeID, Value: incValue}
		orderedDecrements[i] = CounterEntry{NodeID: nodeID, Value: decValue}
	}

	return msgpack.Marshal([]any{orderedIncrements, orderedDecrements})
}

// Helper method to standardize logging of counter state
func (n *Node) logCounterState(msg string, additionalFields ...any) {
	increments, decrements := n.counter.Counters()
	fields := []any{
		"node", n.config.Addr,
		"counter_value", n.counter.Value(),
		"increments", increments,
		"decrements", decrements,
	}

	// Append any additional context fields
	fields = append(fields, additionalFields...)

	n.logger.Info(msg, fields...)
}

```

- **`prepareCounterMessage`:** Packages the full CRDT state (increments/decrements) into a message, mainly for `MessageTypePush`.

- **`prepareDigestMessage`:** Creates messages for efficient digest-based synchronization (`DigestPull`, `DigestAck`).

  - `DigestPull`: Calculates a state digest (`xxhash`) using a stable representation from `deterministicSerialize` for quick consistency checks.
  - `DigestAck`: Constructs an acknowledgment, typically confirming synchronization via a digest.

- **`deterministicSerialize`:** Crucial for reliable digests. It overcomes Go's map iteration randomization by ordering elements based on node IDs before serialization.

- **`logCounterState`:** Simple logging helper.

Finally, we add methods that form the public API for interacting with the node locally:

```go
func (n *Node) Increment() {
	assertions.AssertNotNil(n.counter, "node counter cannot be nil")

	oldValue := n.counter.Value()
	n.counter.Increment(n.config.Addr)
	newValue := n.counter.Value()

	increments, decrements := n.counter.Counters()
	n.logger.Info("incremented counter",
		"node", n.config.Addr,
		"from", oldValue,
		"to", newValue,
		"increments", increments,
		"decrements", decrements,
	)
}

func (n *Node) Decrement() {
	assertions.AssertNotNil(n.counter, "node counter cannot be nil")

	oldValue := n.counter.Value()
	n.counter.Decrement(n.config.Addr)
	newValue := n.counter.Value()

	increments, decrements := n.counter.Counters()

	n.logger.Info("decremented counter",
		"node", n.config.Addr,
		"from", oldValue,
		"to", newValue,
		"increments", increments,
		"decrements", decrements)
}

func (n *Node) GetCounter() int64 {
	assertions.AssertNotNil(n.counter, "node counter cannot be nil")
	return n.counter.Value()
}

func (n *Node) GetLocalCounter() int64 {
	assertions.AssertNotNil(n.counter, "node counter cannot be nil")
	return n.counter.LocalValue(n.config.Addr)
}

func (n *Node) GetAddr() string {
	assertions.Assert(n.config.Addr != "", "node addr cannot be empty")
	return n.config.Addr
}

func (n *Node) Close() error {
	assertions.AssertNotNil(n.cancel, "cancel function cannot be nil")
	assertions.AssertNotNil(n.transport, "transport cannot be nil")

	n.cancel()
	return n.transport.Close()
}
```

- **`Increment` / `Decrement`:** Modify the node's local contribution to the counter and log the change.
- **`GetCounter`:** Returns the counter's current globally merged value.
- **`GetLocalCounter`:** Returns only this node's contribution to the value.
- **`GetAddr`:** Returns the node's configured address/ID.
- **`Close`:** Initiates graceful shutdown of the node and its transport.

Here comes the fun part `handleIncMsg`.

```go
func (n *Node) handleIncMsg(inc MessageInfo) {
	assertions.Assert(
		inc.message.Type == protocol.MessageTypePush ||
			inc.message.Type == protocol.MessageTypeDigestAck ||
			inc.message.Type == protocol.MessageTypeDigestPull,
		"invalid message type")

	n.logger.Info("received message",
		"node", n.config.Addr,
		"from", inc.addr,
		"message_type", inc.message.Type,
		"remote_node_id", inc.message.NodeID)

	switch inc.message.Type {
	case protocol.MessageTypeDigestPull:
		// Create our counters hash
		increments, decrements := n.counter.Counters()
		data, err := deterministicSerialize(increments, decrements)
		if err != nil {
			n.logger.Error("failed to serialize counters",
				"node", n.config.Addr,
				"counter_value", n.counter.Value(),
				"error", err)
			return
		}

		countersHash := xxhash.Sum64(data)

		if countersHash == inc.message.Digest {
			// Digests match - send ack with matching digest
			ackMsg := n.prepareDigestMessage(protocol.MessageTypeDigestAck, inc.message.Digest)

			n.logger.Info("sending digest acknowledgment (digests match)",
				"node", n.config.Addr,
				"target", inc.addr,
				"digest", countersHash,
				"counter_value", n.counter.Value())

			n.outgoingMsg <- MessageInfo{
				addr:    inc.addr,
				message: ackMsg,
			}
		} else {
			// Digests don't match - send full state
			responseMsg := n.prepareCounterMessage(protocol.MessageTypePush)

			n.logger.Info("sending full state (digests don't match)",
				"node", n.config.Addr,
				"target", inc.addr,
				"local_digest", countersHash,
				"remote_digest", inc.message.Digest,
				"counter_value", n.counter.Value())

			n.outgoingMsg <- MessageInfo{
				message: responseMsg,
				addr:    inc.addr,
			}
		}
	case protocol.MessageTypeDigestAck:
		n.logger.Info("received digest acknowledgment",
			"node", n.config.Addr,
			"from", inc.addr,
			"digest", inc.message.Digest,
			"counter_value", n.counter.Value())
		return

	case protocol.MessageTypePush:
		oldValue := n.counter.Value()

		// For push messages, create a counter and merge it
		tempCounter := crdt.New(inc.message.NodeID)
		tempCounter.MergeIncrements(inc.message.IncrementValues)
		tempCounter.MergeDecrements(inc.message.DecrementValues)

		// Merge with our local counter
		updated := n.counter.Merge(tempCounter)

		if updated {
			newValue := n.counter.Value()
			increments, decrements := n.counter.Counters()
			n.logger.Info("counter updated after merge",
				"node", n.config.Addr,
				"from", oldValue,
				"to", newValue,
				"increments", increments,
				"decrements", decrements,
				"from_node", inc.message.NodeID)
		} else {
			n.logger.Info("received push message (no changes)",
				"node", n.config.Addr,
				"from", inc.addr,
				"counter_value", n.counter.Value())
		}
	}
}
```

So, the high-level flow is that we expect 3 message types. If it's `MessageTypeDigestPull`, there are two paths: we either compare the digests and respond with an Ack, or we send the full state. If it's `MessageTypeDigestAck`, we just log it because it's just a confirmation. If it's a `MessageTypePush`, we merge it with our local CRDT state.

Let's move on to sync methods.

```go
func (n *Node) performFullStateSync() {
	peers := n.peers.GetPeers()
	if len(peers) == 0 {
		n.logger.Info("skipping full state sync - no peers available", "node", n.config.Addr)
		return
	}

	// Select a subset of random peers for full state sync
	numPeers := max(1, min(n.config.MaxSyncPeers/2, len(peers)))
	selectedPeers := make([]string, len(peers))
	copy(selectedPeers, peers)
	rand.Shuffle(len(selectedPeers), func(i, j int) {
		selectedPeers[i], selectedPeers[j] = selectedPeers[j], selectedPeers[i]
	})

	// Prepare full state message
	message := n.prepareCounterMessage(protocol.MessageTypePush)

	n.logCounterState("performing full state sync (anti-entropy)",
		"peers_count", numPeers,
		"selected_peers", selectedPeers[:numPeers])

	// Send to selected peers
	for _, peer := range selectedPeers[:numPeers] {
		n.outgoingMsg <- MessageInfo{
			message: message,
			addr:    peer,
		}
	}
}
```

For better **convergence** and availability (a form of anti-entropy), we **periodically** send our entire state via `MessageTypePush` to a **random subset of peers**. Selecting peers **randomly** is critical for convergence; if we kept sending only to the same nodes and they went down, it would defeat the purpose of reliably propagating state. We use `rand.Shuffle` within `performFullStateSync` to ensure the peer selection is random for each sync cycle.

There is one more piece left to complete our node, `initiateDigestSync`.

```go
func (n *Node) initiateDigestSync() {
	peers := n.peers.GetPeers()

	if len(peers) == 0 {
		n.logger.Info("skipping digest sync - no peers available", "node", n.config.Addr)
		return
	}

	numPeers := min(n.config.MaxSyncPeers, len(peers))
	assertions.Assert(numPeers > 0, "number of peers to sync with must be positive")

	selectedPeers := make([]string, len(peers))
	copy(selectedPeers, peers)
	rand.Shuffle(len(selectedPeers), func(i, j int) {
		selectedPeers[i], selectedPeers[j] = selectedPeers[j], selectedPeers[i]
	})

	ctx, cancel := context.WithTimeout(n.ctx, n.config.SyncInterval/2)
	defer cancel()

	g, ctx := errgroup.WithContext(ctx)

	message := n.prepareDigestMessage(protocol.MessageTypeDigestPull)

	n.logCounterState("initiating digest sync",
		"selected_peers", selectedPeers[:numPeers],
		"digest", message.Digest)

	for _, peer := range selectedPeers[:numPeers] {
		peerAddr := peer // Shadow the variable for goroutine
		g.Go(func() error {
			n.logger.Info("sending digest pull",
				"node", n.config.Addr,
				"target", peerAddr,
				"digest", message.Digest)

			select {
			case n.outgoingMsg <- MessageInfo{
				message: message,
				addr:    peerAddr,
			}:
				return nil
			case <-ctx.Done():
				return ctx.Err()
			}
		})
	}

	if err := g.Wait(); err != nil {
		n.logger.Error("sync round failed",
			"node", n.config.Addr,
			"error", err)
	}
}
```

To complement the less frequent full sync, `initiateDigestSync` performs more frequent, lightweight consistency checks using state digests. Triggered periodically (by `syncTick`), it sends a `MessageTypeDigestPull` message, containing only our current state's digest generated via `prepareDigestMessage`, to a random subset of peers (up to `MaxSyncPeers`).

Random peer selection using `rand.Shuffle` ensures we check against different nodes over time. The function sends these `DigestPull` requests concurrently to the selected peers using an `errgroup.WithContext`. Importantly, this entire sync operation is controlled by a context with a timeout (half of the `SyncInterval`) to prevent the node from getting stuck if peers are unresponsive or the outgoing channel is blocked.

This digest-based approach significantly reduces network bandwidth compared to sending the full state, especially when nodes are already synchronized. As detailed in `handleIncMsg`, a peer receiving this `DigestPull` will either reply with a simple `DigestAck` if its state digest matches, or send back its full state via `MessageTypePush` if the digests differ.

The Node structure and its core event loop managing state, messages, and synchronization are now defined. It's time to put this implementation to the test. We'll create an in-memory Transport that simulates message passing between nodes locally, allowing us to verify state convergence after various operations and sync cycles. Let's dive into the tests.

## Node - Tests

Let's start by defining our helpers for our tests .

```go
// node/node_test.go
package node

import (
	"fmt"
	"sync"
	"testing"
	"time"

	"github.com/stretchr/testify/require"
)

type MemoryTransport struct {
	addr            string
	handler         func(addr string, data []byte) error
	mu              sync.RWMutex
	partitionedFrom map[string]bool // Track which nodes this node is partitioned from
}

func NewMemoryTransport(addr string) *MemoryTransport {
	return &MemoryTransport{
		addr:            addr,
		partitionedFrom: make(map[string]bool),
	}
}

func (t *MemoryTransport) Send(addr string, data []byte) error {
	time.Sleep(10 * time.Millisecond) // Prevent message flood

	// Check if recipient is in our partition list
	t.mu.RLock()
	partitioned := t.partitionedFrom[addr]
	t.mu.RUnlock()

	if partitioned {
		return fmt.Errorf("network partition: cannot send to %s from %s", addr, t.addr)
	}

	// Get the transport while holding the global lock
	tmu.RLock()
	transport, exists := transports[addr]
	tmu.RUnlock()
	if !exists {
		return fmt.Errorf("transport not found for address: %s", addr)
	}

	// Check if sender is in recipient's partition list
	transport.mu.RLock()
	senderPartitioned := transport.partitionedFrom[t.addr]
	transport.mu.RUnlock()

	if senderPartitioned {
		return fmt.Errorf("network partition: cannot receive from %s at %s", t.addr, addr)
	}

	// Get the handler while holding the transport's lock
	transport.mu.RLock()
	handler := transport.handler
	transport.mu.RUnlock()
	if handler == nil {
		return fmt.Errorf("no handler registered for address: %s", addr)
	}

	// Call the handler outside of any locks
	return handler(t.addr, data)
}

// AddPartition simulates a network partition between this node and another
func (t *MemoryTransport) AddPartition(addr string) {
	t.mu.Lock()
	defer t.mu.Unlock()
	t.partitionedFrom[addr] = true
}

// RemovePartition removes a simulated network partition
func (t *MemoryTransport) RemovePartition(addr string) {
	t.mu.Lock()
	defer t.mu.Unlock()
	delete(t.partitionedFrom, addr)
}

// CreateBidirectionalPartition creates a partition between two nodes
func CreateBidirectionalPartition(t *testing.T, addr1, addr2 string) {
	transport1, exists1 := GetTransport(addr1)
	transport2, exists2 := GetTransport(addr2)

	require.True(t, exists1, "Transport for %s should exist", addr1)
	require.True(t, exists2, "Transport for %s should exist", addr2)

	transport1.AddPartition(addr2)
	transport2.AddPartition(addr1)
}

// HealBidirectionalPartition heals a partition between two nodes
func HealBidirectionalPartition(t *testing.T, addr1, addr2 string) {
	transport1, exists1 := GetTransport(addr1)
	transport2, exists2 := GetTransport(addr2)

	require.True(t, exists1, "Transport for %s should exist", addr1)
	require.True(t, exists2, "Transport for %s should exist", addr2)

	transport1.RemovePartition(addr2)
	transport2.RemovePartition(addr1)
}

func (t *MemoryTransport) Listen(handler func(addr string, data []byte) error) error {
	t.mu.Lock()
	defer t.mu.Unlock()
	t.handler = handler
	tmu.Lock()
	transports[t.addr] = t
	tmu.Unlock()
	return nil
}

func (t *MemoryTransport) Close() error {
	t.mu.Lock()
	defer t.mu.Unlock()
	tmu.Lock()
	delete(transports, t.addr)
	tmu.Unlock()
	return nil
}

var (
	transports = make(map[string]*MemoryTransport)
	tmu        sync.RWMutex
)

// waitForConvergence verifies that all nodes converge to the expected counter value
// within the given timeout
func waitForConvergence(t *testing.T, nodes []*Node, expectedTotalCounter int64, timeout time.Duration) {
	deadline := time.Now().Add(timeout)
	lastLog := time.Now()
	logInterval := 200 * time.Millisecond

	for time.Now().Before(deadline) {
		allConverged := true
		allValues := make(map[string]int64)

		for _, n := range nodes {
			// Get the total counter value
			totalCounter := n.GetCounter()
			allValues[n.GetAddr()] = totalCounter

			if totalCounter != expectedTotalCounter {
				allConverged = false
			}
		}

		// Only log at intervals to reduce spam
		if !allConverged && time.Since(lastLog) > logInterval {
			t.Logf("Waiting for convergence: %v (expected %d)", allValues, expectedTotalCounter)
			lastLog = time.Now()
		}

		if allConverged {
			t.Logf("All nodes converged to %d", expectedTotalCounter)
			return
		}

		time.Sleep(50 * time.Millisecond)
	}

	// Log detailed state information for debugging
	t.Log("Detailed node states at convergence failure:")
	for _, n := range nodes {
		increments, decrements := n.counter.Counters()
		t.Logf("Node %s: total counter = %d, inc=%v, dec=%v",
			n.GetAddr(), n.GetCounter(), increments, decrements)
	}

	t.Fatalf("nodes did not converge within timeout. Expected total counter = %d",
		expectedTotalCounter)
}

// GetTransport retrieves a transport for testing purposes
func GetTransport(addr string) (*MemoryTransport, bool) {
	tmu.RLock()
	defer tmu.RUnlock()
	transport, exists := transports[addr]
	return transport, exists
}

// createTestNode creates a new node with a memory transport for testing
func createTestNode(t *testing.T, addr string, syncInterval time.Duration) *Node {
	transport := NewMemoryTransport(addr)
	config := Config{
		Addr:         addr,
		SyncInterval: syncInterval,
		MaxSyncPeers: 2,
	}
	node, err := NewNode(config, transport)
	require.NoError(t, err)
	return node
}

```

To test our `Node` effectively, we first need several helpers. The most important is `MemoryTransport`, an in-memory implementation of the `protocol.Transport` interface. It uses a shared global map (`transports`, protected by `tmu`) to route messages between test nodes and includes methods (`AddPartition`, `RemovePartition`) to simulate network partitions. Helpers like `Create/HealBidirectionalPartition` simplify setting up these partitions between two specific nodes.

We also need a way to verify consensus. The `waitForConvergence` function handles this by polling a list of nodes until their counters (`GetCounter()`) all match an expected value or a specified `timeout` occurs, logging progress and details on failure.

Finally, `createTestNode` is a simple factory function to instantiate a `Node` using our `MemoryTransport` for easy test setup, and `GetTransport` allows retrieving a specific transport instance during tests (e.g., to manipulate partitions).

### Concurrent Update Test

First, we need to ensure that nodes converge correctly when concurrent events occur. We already covered this specific case for our CRDT in Part 0, but this test confirms that the integration works correctly between our `Node` (handling messages, performing sync) and the underlying `PNCounter`.

```go
func TestConcurrentIncrement(t *testing.T) {
	node1 := createTestNode(t, "node1", 100*time.Millisecond)
	node2 := createTestNode(t, "node2", 100*time.Millisecond)
	node3 := createTestNode(t, "node3", 100*time.Millisecond)

	node1.peers.SetPeers([]string{"node2", "node3"})
	node2.peers.SetPeers([]string{"node1", "node3"})
	node3.peers.SetPeers([]string{"node2", "node1"})

	var wg1 sync.WaitGroup
	var wg2 sync.WaitGroup
	var wg3 sync.WaitGroup

	wg1.Add(1)
	go func() {
		defer wg1.Done()
		for range 100 {
			node1.Increment()
			// Small sleep to prevent overloading
			time.Sleep(1 * time.Millisecond)
		}
	}()

	wg2.Add(1)
	go func() {
		defer wg2.Done()
		for range 100 {
			node2.Increment()
			// Small sleep to prevent overloading
			time.Sleep(1 * time.Millisecond)
		}
	}()

	wg3.Add(1)
	go func() {
		defer wg3.Done()
		for range 100 {
			node3.Decrement()
			// Small sleep to prevent overloading
			time.Sleep(1 * time.Millisecond)
		}
	}()

	wg1.Wait()
	wg2.Wait()
	wg3.Wait()

	waitForConvergence(t, []*Node{node1, node2, node3}, 100, 5*time.Second)

	node1.Close()
	node2.Close()
	node3.Close()

	time.Sleep(500 * time.Millisecond)
}
```

### Late Joining Node Test

Now that we've confirmed basic concurrent operations, let's see how our nodes behave when a node joins the cluster later. This is a common scenario; nodes will come and go, but our cluster should remain resilient thanks to the periodic synchronization mechanisms.

```go
func TestLateJoiningNode(t *testing.T) {
	node1 := createTestNode(t, "node1", 100*time.Millisecond)
	node2 := createTestNode(t, "node2", 100*time.Millisecond)

	// Initially, only node1 knows about node2, node2 knows no one
	node1.peers.SetPeers([]string{"node2"})

	// Node1 performs operations while node2 is effectively unaware/disconnected
	for range 50 {
		node1.Increment()
		time.Sleep(1 * time.Millisecond)
	}

	// Node2 "joins" by learning about node1
	node2.peers.SetPeers([]string{"node1"})

	// Nodes should converge to node1's initial state
	waitForConvergence(t, []*Node{node1, node2}, 50, 2*time.Second)

	// Node2 now performs operations
	for range 30 {
		node2.Increment()
		time.Sleep(1 * time.Millisecond)
	}

	// Nodes should converge to the combined state
	waitForConvergence(t, []*Node{node1, node2}, 80, 2*time.Second)

	// Verify internal CRDT state for correctness
	counters1, _ := node1.counter.Counters()
	counters2, _ := node2.counter.Counters()
	require.Equal(t, uint64(50), counters1["node1"], "Node1 map state incorrect for node1")
	require.Equal(t, uint64(30), counters1["node2"], "Node1 map state incorrect for node2")
	require.Equal(t, uint64(50), counters2["node1"], "Node2 map state incorrect for node1")
	require.Equal(t, uint64(30), counters2["node2"], "Node2 map state incorrect for node2")

	// Clean up
	node1.Close()
	node2.Close()

	// Allow time for graceful shutdown
	time.Sleep(500 * time.Millisecond)
}
```

### Network Partition Test

Now let's test partitioning. This test will isolate one node, allow operations to occur on both sides of the partition, verify the partial states, then heal the partition and check for final convergence.

```go
func TestNetworkPartition(t *testing.T) {
	node1 := createTestNode(t, "node1", 100*time.Millisecond)
	node2 := createTestNode(t, "node2", 100*time.Millisecond)
	node3 := createTestNode(t, "node3", 100*time.Millisecond)

	// Start fully connected
	node1.peers.SetPeers([]string{"node2", "node3"})
	node2.peers.SetPeers([]string{"node1", "node3"})
	node3.peers.SetPeers([]string{"node1", "node2"})

	// Initial increments and convergence
	node1.Increment()
	node2.Increment()
	node3.Increment()
	waitForConvergence(t, []*Node{node1, node2, node3}, 3, 2*time.Second)

	// Partition: Isolate node3 from node1 and node2
	t.Log("Creating partition: (node1 <-> node2) | (node3)")
	CreateBidirectionalPartition(t, "node1", "node3")
	CreateBidirectionalPartition(t, "node2", "node3")
	// Update peers for nodes that can still communicate
	node1.peers.SetPeers([]string{"node2"})
	node2.peers.SetPeers([]string{"node1"})
	// node3's peer list remains unchanged, it doesn't know it's partitioned yet

	t.Log("Incrementing node1 and node2 during partition")
	for range 10 {
		node1.Increment() // Should sync with node2
		node2.Increment() // Should sync with node1
		time.Sleep(1 * time.Millisecond)
	}

	t.Log("Incrementing isolated node3 during partition")
	for range 5 {
		node3.Increment() // Cannot sync with others
		time.Sleep(1 * time.Millisecond)
	}

	// Verify partial convergence (node1 and node2 should agree)
	// Expected value: 3 (initial) + 10 (node1) + 10 (node2) = 23
	waitForConvergence(t, []*Node{node1, node2}, 23, 2*time.Second)

	// Verify isolated node3's state
	// Expected value: 3 (initial) + 5 (node3) = 8
	require.Equal(t, int64(8), node3.GetCounter(),
		"Node3 should have 8 total increments during partition")

	t.Log("State before healing partition:")
	logDetailedState(t, []*Node{node1, node2, node3})

	// Heal the partition
	t.Log("Healing network partition")
	HealBidirectionalPartition(t, "node1", "node3")
	HealBidirectionalPartition(t, "node2", "node3")
	// Restore full peer lists
	node1.peers.SetPeers([]string{"node2", "node3"})
	node2.peers.SetPeers([]string{"node1", "node3"})
	node3.peers.SetPeers([]string{"node1", "node2"}) // node3 can now potentially sync

	// Nodes should eventually converge to the total state
	// Expected value: 23 (node1/2 state) + 5 (node3's contribution) = 28
	// Or: 3 (initial) + 10 (node1) + 10 (node2) + 5 (node3) = 28
	t.Log("Waiting for convergence after healing...")
	waitForConvergence(t, []*Node{node1, node2, node3}, 28, 5*time.Second)

	t.Log("Final state after convergence:")
	logDetailedState(t, []*Node{node1, node2, node3})

	// Clean up
	node1.Close()
	node2.Close()
	node3.Close()

	// Allow time for graceful shutdown
	time.Sleep(500 * time.Millisecond)
}

// Helper to log detailed state of nodes
func logDetailedState(t *testing.T, nodes []*Node) {
	for _, n := range nodes {
		increments, decrements := n.counter.Counters()
		t.Logf("  Node %s: counter=%d, inc=%v, dec=%v",
			n.GetAddr(), n.GetCounter(), increments, decrements)
	}
}
```

---

## Conclusion

In this second part of the series, we've built the essential `Node` component that orchestrates our distributed counter. We started by defining a clear communication protocol, including message types (`Push`, `DigestPull`, `DigestAck`), serialization with and compression.

We then constructed the `Node` itself, integrating the CRDT within a core `eventLoop`. This loop handles incoming messages, manages outgoing messages, and triggers periodic synchronization via two distinct mechanisms:

1.  Frequent, lightweight **digest-based syncs** (`initiateDigestSync`) to efficiently check for state differences.
2.  Less frequent **full state syncs** (`performFullStateSync`) as an anti-entropy measure to guarantee eventual consistency.

We introduced the `Transport` interface and implemented an in-memory version (`MemoryTransport`). This allowed us to test the node's logic in isolation from network complexities.

We now have a functioning, testable node implementation with core synchronization logic built upon our CRDT foundation. The next step in **Part 2** will be to replace the in-memory transport with a real TCP-based network layer and begin building more sophisticated peer management. Stay tuned!

_If you found this post helpful, feel free to share it and check back for the next part in this series. You can also find the complete code for this implementation on [GitHub](https://github.com/ogzhanolguncu/distributed-counter/part1)._
