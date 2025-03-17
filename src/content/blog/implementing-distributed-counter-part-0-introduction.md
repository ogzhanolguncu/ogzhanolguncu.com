---
pubDatetime: 2025-02-16
title: "Implementing Distributed Counter: Part 0: Introduction"
slug: implementing-distributed-counter-part-0-introduction
tags:
  - go
  - distributed
  - network_programming
description: Implementing gossip protocol with golang
---

This is the first of a series of posts about implementing a distributed counter in Go.

- **Part 0: Introduction (You are here)**
- _Part 1: TCP and Network Layer (Not yet published)_
- _Part 2: Peer Discovery Service (Not yet published)_
- _Part 3: Consistency & Recoverability (Not yet published)_

In this series of posts, we are going to build a "Distributed Counter" from scratch using Gossip Protocol. Before going forward, let's discuss the motivation for this series.

### Why Distributed Counter and Why This Series

I've been trying to understand how Gossip Protocol is used in real-world distributed systems. To scratch that itch, I needed to find a simple problem to solve so I could focus on the Gossip Protocol itself instead of spending countless hours on some other topic I wasn't familiar with.

So I decided to build a simple counter where you can increment or decrement a number. Since the actual problem is really easy to solve without the distributed part, this allowed me to concentrate on the distributed concepts like:

- How data propagates through the system
- How information persists across nodes
- What happens when a new counter joins our system (cluster)
- How to handle network partitions and node failures
- Implementing eventual consistency in a practical way

#### Why a counter specifically?

It's the "Hello World" of distributed systems - simple enough that the core functionality doesn't distract from the distributed challenges, but complex enough to demonstrate real-world issues like:

- Conflict resolution: What happens when two nodes increment simultaneously?
- State convergence: How do we ensure all nodes eventually reach the same count?
- Fault tolerance: How does the system handle nodes going offline and coming back?

#### Why this series?

Before I started this series, I had a hard time finding decent material to help me out in my learning journey.
So I thought I ought to make one to help others in their journeys. Then I decided to document this process to give back to the community.

### Understanding CAP in Our Distributed Counter

In our distributed counter we'll mainly focus on **AP** (Availability and Partition tolerance) parts of CAP. Why not strong Consistency you may ask? In the CAP theorem, consistency specifically refers to linearizability (sometimes called strong consistency), which is about all nodes seeing the same data at the same time. We don't need this strong consistency for our counter; we need _eventual_ consistency. Our primary concern is ensuring that all nodes (counters) in our cluster (a bunch of counters) converge to the same final value, regardless of the order in which operations occur.

Since the precise operation order isn't critical for a counter - does it really matter if increments and decrements happen in the sequence **4-3-2-1-6**? No. What matters is that all nodes eventually reach the same consistent state.

### Implementation Approach

We'll be implementing this distributed counter in Go, which is well-suited for building networked systems due to its excellent concurrency support.
Its standard library also provides robust networking packages that we'll use throughout this series.
Even if you're not familiar with Go, the concepts we'll explore apply broadly to distributed systems development in any language.

We'll also use a bit of [DbC](https://en.wikipedia.org/wiki/Design_by_contract) (Design By Contract), basically we'll do some before and after assertion for our operations.

An example:

```go
func (n *Node) Increment() {
	oldCounter := n.state.counter.Load()
	oldVersion := n.state.version.Load()

	n.state.counter.Add(1)
	n.state.version.Add(1)

	assertions.Assert(oldCounter < n.state.counter.Load(), "counter must increase after Increment")
	assertions.Assert(oldVersion < n.state.version.Load(), "version must increase after Increment")
	n.broadcastUpdate()
}
```

#### Final system architecture at end of this series

```
                GOSSIP PROTOCOL ARCHITECTURE
                ===========================
                    +----------------+
                    |    Client      |
                    +--------+-------+
                             |
                             | HTTP
                             v
                    +----------------+
                    |  API Gateway   |
                    |----------------|
                    | Load Balancer  |
                    | Reverse Proxy  |
                    |----------------|
                    | Endpoints:     |
                    | GET  /counter  |
                    | POST /increment|
                    | POST /decrement|
                    | GET  /nodes    |
                    | GET  /health   |
                    +--------+-------+
                             |
                             | HTTP
                    +--------+--------+
                    |                 |

+---------------+             +---------------+             +---------------+
|    Node 1     |             |    Node 2     |             |    Node 3     |
|---------------|             |---------------|             |---------------|
| Counter: 42   |<-PULL/PUSH->| Counter: 42   |<-PULL/PUSH->| Counter: 42   |
| Version: 5    |    Data     | Version: 5    |    Data     | Version: 5    |
| PeerManager   |  Exchange   | PeerManager   |  Exchange   | PeerManager   |
| TCPTransport  |             | TCPTransport  |             | TCPTransport  |
| WAL (optional)|             | WAL (optional)|             | WAL (optional)|
+---------------+     |       +---------------+     |       +---------------+
      ^   |           |             ^   |           |             ^   |
      |   | HTTP      |             |   | HTTP      |             |   | HTTP
      |   v           |             |   v           |             |   v
+---------------+     |       +---------------+     |       +---------------+
|DiscoveryClient|     |       |DiscoveryClient|     |       |DiscoveryClient|
+---------------+     |       +---------------+     |       +---------------+
      |   ^           |             |   ^           |             |   ^
      |   | Register  |             |   | Register  |             |   | Register
      |   | Heartbeat |             |   | Heartbeat |             |   | Heartbeat
      |   | GetPeers  |             |   | GetPeers  |             |   | GetPeers
      v   |           v             v   |           v             v   |
+-----------------------------------------------------------------------------+
|                          Discovery Server                                   |
|-----------------------------------------------------------------------------|
| - knownPeers: {"node1": {LastSeen}, "node2": {LastSeen}, "node3": {...}}   |
| - Endpoints:                                                                |
|   * POST /register - Nodes register themselves                              |
|   * POST /heartbeat - Nodes indicate they're alive                          |
|   * GET /peers - Nodes discover other nodes                                 |
+-----------------------------------------------------------------------------+
```

This will be our final architecture and in each post, we'll work towards that goal.
The first part is all about getting our nodes up and running with static configuration so they can start talking to each other.
Since we don't want to complicate things, we'll run everything in-memory and see how things work.

### Let's Get Started

This will be our end result file structure at the end of this part.

```sh
.
├── assertions
│   └── assertions.go
├── node
│   ├── node.go
│   └── node_test.go
└── protocol
    ├── message.go
    └── message_test.go
```

Let's not waste any more time and create our first file

```go
// assertions/assertions.go
package assertions

import (
	"fmt"
	"runtime"
)

func Assert(condition bool, msg string) {
	if !condition {
		_, file, line, _ := runtime.Caller(1)
		errorMsg := fmt.Sprintf("Assertion failed: %s\nFile: %s:%d", msg, file, line)
		panic(errorMsg)
	}
}

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

The reason for these assertions is if something unexpected happens we wanna fail fast and detect it before it's too late.

Before we move on to the node implementation let's first take a look at our payload structure and protocol details.

We have two types of messages one for sending and one for receiving. In the gossip protocol jargon they are called `pull` and `push`.
Since they are nothing more than an identifier about message type, 1 byte is quite enough.

```go
const (
	MessageTypePull = 0x01
	MessageTypePush = 0x02
)
```

Our payload will be 13 bytes in total: 1 byte for message type, 4 bytes for version, 8 bytes for our counter value.

Let's define it.

```go
const (
	TypeSize    = 1
	VersionSize = 4
	CounterSize = 8
	MessageSize = TypeSize + VersionSize + CounterSize
)

type Message struct {
	Type    byte
	Version uint32
	Counter uint64
}
```

Now, we need a way to encode and decode these messages before we read or write to TCP. To deterministically parse the []byte, we'll use big-endian notation. Consistent byte order ensures we'll read and write the same data each time we process it.

```go
func (m *Message) Encode() []byte {
	buf := make([]byte, MessageSize)
	buf[0] = m.Type
	binary.BigEndian.PutUint32(buf[1:5], m.Version)
	binary.BigEndian.PutUint64(buf[5:], m.Counter)

	assertions.AssertEqual(MessageSize, len(buf), "encoded message size must match expected size")
	return buf
}

func DecodeMessage(data []byte) (*Message, error) {
	if len(data) < MessageSize {
		return nil, fmt.Errorf("message too short: %d bytes", len(data))
	}

	return &Message{
		Type:    data[0],
		Version: binary.BigEndian.Uint32(data[1:5]),
		Counter: binary.BigEndian.Uint64(data[5:]),
	}, nil
}
```

And, finally, let's define our interface for sending and receiving data. We're creating this abstraction because we'll implement two versions of Transport: an in-memory implementation for testing and a TCP implementation for production use.

```go
type Transport interface {
	Send(addr string, data []byte) error
	Listen(handler func(addr string, data []byte) error) error
	Close() error
}
```

Complete protocol code:

```go
// protocol/message.go
package protocol

import (
	"encoding/binary"
	"fmt"

	"github.com/ogzhanolguncu/distributed-counter/part0/assertions"
)

const (
	MessageTypePull = 0x01
	MessageTypePush = 0x02
)

const (
	TypeSize    = 1
	VersionSize = 4
	CounterSize = 8
	MessageSize = TypeSize + VersionSize + CounterSize
)

type Message struct {
	Type    byte
	Version uint32
	Counter uint64
}

func (m *Message) Encode() []byte {
	buf := make([]byte, MessageSize)
	buf[0] = m.Type
	binary.BigEndian.PutUint32(buf[1:5], m.Version)
	binary.BigEndian.PutUint64(buf[5:], m.Counter)

	assertions.AssertEqual(MessageSize, len(buf), "encoded message size must match expected size")
	return buf
}

func DecodeMessage(data []byte) (*Message, error) {
	if len(data) < MessageSize {
		return nil, fmt.Errorf("message too short: %d bytes", len(data))
	}

	return &Message{
		Type:    data[0],
		Version: binary.BigEndian.Uint32(data[1:5]),
		Counter: binary.BigEndian.Uint64(data[5:]),
	}, nil
}

type Transport interface {
	Send(addr string, data []byte) error
	Listen(handler func(addr string, data []byte) error) error
	Close() error
}
```

Moving on to testing:

Let's build out our test suite now.

> First, install the `require` package: `go get github.com/stretchr/testify/require`

```go
package protocol

import (
	"fmt"
	"testing"

	"github.com/stretchr/testify/require"
)

func TestMessages(t *testing.T) {
	messages := []Message{
		{Type: MessageTypePush, Version: 1, Counter: 12},
		{Type: MessageTypePull, Version: 2, Counter: 0},
		{Type: MessageTypePush, Version: ^uint32(0), Counter: ^uint64(0)}, // Max values
	}

	for _, msg := range messages {
		t.Run(fmt.Sprintf("Type=0x%02x,Ver=%d,Counter=%d", msg.Type, msg.Version, msg.Counter), func(t *testing.T) {
			encoded := msg.Encode()
			decoded, err := DecodeMessage(encoded)

			require.NoError(t, err)
			require.Equal(t, msg, *decoded)
			require.Equal(t, 13, len(encoded))
		})
	}
}

func TestDecodeMessageErrors(t *testing.T) {
	invalidInputs := []struct {
		input   []byte
		wantErr string
	}{
		{[]byte{}, "message too short: 0 bytes"},
		{[]byte{0x02, 0x00, 0x00, 0x00}, "message too short: 4 bytes"},
	}

	for _, tc := range invalidInputs {
		t.Run(fmt.Sprintf("len=%d", len(tc.input)), func(t *testing.T) {
			_, err := DecodeMessage(tc.input)
			require.Error(t, err)
			require.Contains(t, err.Error(), tc.wantErr)
		})
	}
}
```

Now that we have our protocol sorted out, let's tackle the node implementation where all the real action happens.

```go
const defaultChannelBuffer = 100

// Config is required to bootstrap our node.
type Config struct {
	Addr         string
	SyncInterval time.Duration
	MaxSyncPeers int
}

// State is the current state of our node.
type State struct {
	counter atomic.Uint64
	version atomic.Uint32
}


// MessageInfo is the payload + address of the node that we send to or receive from
type MessageInfo struct {
	message protocol.Message
	addr    string
}

type Node struct {
	config Config
	state  *State

	peers   []string
	peersMu sync.RWMutex

	transport protocol.Transport
	ctx       context.Context
	cancel    context.CancelFunc

	incomingMsg chan MessageInfo
	outgoingMsg chan MessageInfo
	syncTick    <-chan time.Time
}
```

`Node` struct glues everything together. And defines some essential stuff such as `ctx` for handling cancellation and graceful shutdown,
channels to handle incoming and outgoing traffic and `syncTick` for periodic pull of the state of other nodes. And, finally some helpers for handle peer management which we'll move to separate pkg later on.

> The main reason for using `atomic`'s in our `State` for counter and version is that I had basically two options for thread safety: either go with a lock or use atomics. Atomics are more efficient for simple operations like counters and version numbers. They allow multiple goroutines to safely access and modify these values without the overhead of acquiring and releasing locks. When all you need is to increment, read, or update a single value, atomics provide thread safety with better performance, especially in high-contention scenarios where many goroutines might be trying to access the state simultaneously.

Let's first define our peer management helpers.

```go
func (n *Node) SetPeers(peers []string) {
	assertions.Assert(len(peers) > 0, "arg peers cannot be empty")

	n.peersMu.Lock()
	defer n.peersMu.Unlock()
	n.peers = make([]string, len(peers))
	copy(n.peers, peers)

	assertions.AssertEqual(len(n.peers), len(peers), "node's peers should be equal to peers")
}

func (n *Node) GetPeers() []string {
	n.peersMu.RLock()
	defer n.peersMu.RUnlock()
	peers := make([]string, len(n.peers))
	copy(peers, n.peers)
	return peers
}
```

These are pretty straightforward; they allow us to access peers' information. Only critical part is
locking. Without it we might access inconsistent state data. And since it's read more than it's written, we use `RWMutex`.

Let's create our node constructor.

```go
func NewNode(config Config, transport protocol.Transport) (*Node, error) {
	ctx, cancel := context.WithCancel(context.Background())

	assertions.Assert(config.SyncInterval > 0, "sync interval must be positive")
	assertions.Assert(config.MaxSyncPeers > 0, "max sync peers must be positive")
	assertions.Assert(config.Addr != "", "node address cannot be empty")
	assertions.AssertNotNil(transport, "transport cannot be nil")

	node := &Node{
		config:    config,
		state:     &State{},
		peers:     make([]string, 0),
		ctx:       ctx,
		cancel:    cancel,
		transport: transport,

		incomingMsg: make(chan MessageInfo, defaultChannelBuffer),
		outgoingMsg: make(chan MessageInfo, defaultChannelBuffer),
		syncTick:    time.NewTicker(config.SyncInterval).C,
	}

	assertions.AssertNotNil(node.state, "node state must be initialized")
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

Notice how we are asserting stuff to make sure they are in the boundaries or exist?
When we call our constructor we have to make sure of two things. First, we have to start listening incoming traffic without blocking.
Second, we need a way to control of the flow of our node. There are many ways to do it, but in our case we'll do it with channels.

This is how our `eventLoop` works in a nutshell.

```sh
┌────────────────── EVENT LOOP FLOW ─────────────┐
│                                                │
│   ctx.Done ─────────────► shutdown             │
│                                                │
│   incomingMsg ────────────► handleIncMsg       │
│      ▲                          │              │
│      │                          │              │
│   Transport.Listen              │              │
│      ▲                          ▼              │
│      │                     outgoingMsg         │
│      │                          │              │
│   [Peers]                       │              │
│      │                          ▼              │
│      └───────────────── Transport.Send         │
│                               │                │
│   syncTick ───────────────► pullState          │
│                               │                │
│                               ▼                │
│                          outgoingMsg           │
│                               │                │
│                               ▼                │
│                        Transport.Send          │
│                                                │
└────────────────────────────────────────────────┘
```

Now let's jump into the `startTransport` method, which handles the crucial task of setting up our node's network communication.

```go
func (n *Node) startTransport() error {
	err := n.transport.Listen(func(addr string, data []byte) error {
		assertions.Assert(addr != "", "incoming addr cannot be empty")
		assertions.AssertNotNil(data, "incoming data cannot be nil or empty")

		msg, err := protocol.DecodeMessage(data)
		if err != nil {
			return fmt.Errorf("[Node %s]: StartTransport failed to read %w", n.config.Addr, err)
		}
		select {
		case n.incomingMsg <- MessageInfo{message: *msg, addr: addr}:
		default:
			log.Printf("[Node %s]: Dropping message. Channel is full", addr)
		}
		return nil
	})
	if err != nil {
		return fmt.Errorf("[Node %s]: Failed to start transport listener: %w", n.config.Addr, err)
	}

	return nil
}
```

The `transport.Listen` method allows us to pass a callback that gives us access to the caller's `addr` and the incoming data.
We then decode this data using our `protocol.DecodeMessage` function that we defined earlier.
The `select` statement with a `default` case makes the channel send non-blocking:

- If the channel has space: the message is sent
- If the channel is full: execution falls through to the `default` case and drops the message

Without this pattern, the send operation would block until space becomes available in the channel, potentially freezing the transport layer's ability to receive new messages.
The decoded message is then sent to the channel, where it will be picked up by the event loop for processing.

Let's take a closer look at the `eventLoop`, which is the beating heart of our node's message processing system.

```go
func (n *Node) eventLoop() {
	for {
		select {
		case <-n.ctx.Done():
			log.Printf("[Node %s] Shutting down with version=%d and counter=%d",
				n.config.Addr, n.state.version.Load(), n.state.counter.Load())
			return

		case msg := <-n.incomingMsg:
			n.handleIncMsg(msg)

		case msg := <-n.outgoingMsg:
			assertions.Assert(msg.addr != "", "outgoing addr cannot be empty")
			assertions.AssertEqual(protocol.MessageSize, len(msg.message.Encode()), fmt.Sprintf("formatted message cannot be smaller than %d", protocol.MessageSize))

			if err := n.transport.Send(msg.addr, msg.message.Encode()); err != nil {
				log.Printf("[Node %s] Failed to send message to %s: %v",
					n.config.Addr, msg.addr, err)
			}

		case <-n.syncTick:
			n.pullState()
		}
	}
}
```

This `eventLoop` functions like a central router for our node, controlling the flow of all messages and actions. It runs continuously in a `for` loop and uses Go's `select` statement to handle multiple channels concurrently. Here's what each case does:

1. When `n.ctx.Done()` receives a signal (when the node is being shut down), it logs the final state and exits the loop.
2. When a message arrives on the `incomingMsg` channel, it calls `handleIncMsg()` to process it.
3. When a message appears on the `outgoingMsg` channel, it first validates the message (checking that the address isn't empty and the message size is correct), then sends it to the target node using the transport layer. If sending fails, it logs the error but continues running.
4. When the `syncTick` timer fires (based on our configured interval), it calls `pullState()` to request updates from other nodes.

This event-driven approach keeps our node responsive and non-blocking. And, later if we want, we can easily add better logging since this is a centralized piece of our node.

Before moving on to the `handleIncMsg` or `pullState` methods, let's first discuss how we handle conflict resolution and later operations.

```
Scenario 1: Pull Message (Node B wants data from Node A)
----------------------------------------------------

Node B                                 Node A
  |                                      |
  |  -------- PULL v=5, c=10 -------->   |  B sends PULL with its version
  |                                      |  A compares versions
  |                                      |  If B's version > A's version:
  |                                      |    A updates its state
  |                                      |    A broadcasts update to others
  |  <------- PUSH v=7, c=15 ---------   |  A responds with PUSH (its version)
  |                                      |
  | If A's version > B's version:        |
  | B updates its state                  |
  | B broadcasts update to others        |
  |                                      |
```

```
Scenario 2: Push Message (Node A pushes data to Node B)
----------------------------------------------------

Node A                                 Node B
  |                                      |
  |  -------- PUSH v=7, c=15 -------->   |  A sends PUSH with its version
  |                                      |  B compares versions
  |                                      |  If A's version > B's version:
  |                                      |    B updates its state
  |                                      |    B broadcasts update to others
  |                                      |  If A's version <= B's version:
  |                                      |    B does nothing (ignores the push)
  |                                      |
```

The resolution logic is straightforward:

1. If an incoming message has a higher version than the local state, we update our local state and broadcast the update.
2. If an incoming message has a lower or equal version, we keep our current state.

Key points about our implementation:

- Version is the primary factor in conflict resolution
- The counter value is updated along with the version
- For PULL messages, a node always responds with a PUSH containing its current state
- For PUSH messages, a node silently updates if needed
- After any state update, the node broadcasts to all peers to maintain eventual consistency

With these concepts in mind, let's see how we implement the `handleIncMsg` method:

```go
func (n *Node) handleIncMsg(inc MessageInfo) {
    assertions.Assert(inc.message.Type == protocol.MessageTypePull ||
        inc.message.Type == protocol.MessageTypePush,
        "invalid message type")

    log.Printf("[Node %s] Received message from %s type=%d, version=%d, counter=%d",
        n.config.Addr, inc.addr, inc.message.Type, inc.message.Version, inc.message.Counter)

    switch inc.message.Type {
    case protocol.MessageTypePull:
        if inc.message.Version > n.state.version.Load() {
            oldVersion := n.state.version.Load()
            n.state.version.Store(inc.message.Version)
            n.state.counter.Store(inc.message.Counter)
            assertions.Assert(n.state.version.Load() > oldVersion, "version must increase after update")
            n.broadcastUpdate()
        }

        log.Printf("[Node %s] Sent message to %s type=%d, version=%d, counter=%d",
            n.config.Addr, inc.addr, protocol.MessageTypePush, n.state.version.Load(), n.state.counter.Load())
        n.outgoingMsg <- MessageInfo{
            message: protocol.Message{
                Type:    protocol.MessageTypePush,
                Version: n.state.version.Load(),
                Counter: n.state.counter.Load(),
            },
            addr: inc.addr,
        }
    case protocol.MessageTypePush:
        if inc.message.Version > n.state.version.Load() {
            oldVersion := n.state.version.Load()
            n.state.version.Store(inc.message.Version)
            n.state.counter.Store(inc.message.Counter)
            assertions.Assert(n.state.version.Load() > oldVersion, "version must increase after update")
            n.broadcastUpdate()
        }
    }
}
```

The implementation follows these steps:

1. First, we verify the message type to prevent malformed payloads from causing panics in our node.
2. Based on the message type, we handle it appropriately:
   - If it's a PULL or PUSH with a higher version than our local state, we update our state and broadcast the change to other nodes for faster convergence.
   - If it's a PULL message (regardless of version), we always respond with our current state.
   - If it's a PUSH with a lower or equal version, we simply ignore it.

> **⚠️ Performance Warning**
>
> The broadcast after updates is optional but helps the network converge faster. However, in large clusters, **you should carefully consider limiting this behavior** to prevent overwhelming the network with updates. Imagine hundreds of nodes sending updates to each other each time a counter changes - this could quickly saturate your network bandwidth.
>
> Consider these alternatives for large deployments:
>
> - Implement a delayed broadcast mechanism
> - Use a gossip protocol with exponential backoff
> - Only broadcast to a random subset of peers
> - Apply rate limiting to update broadcasts

Let's add our helper methods before moving on to `pullState` and `broadcastUpdate`:

```go
func (n *Node) Increment() {
	assertions.AssertNotNil(n.state, "node state cannot be nil")
	oldCounter := n.state.counter.Load()
	oldVersion := n.state.version.Load()
	n.state.counter.Add(1)
	n.state.version.Add(1)
	assertions.Assert(oldCounter < n.state.counter.Load(), "counter must increase after Increment")
	assertions.Assert(oldVersion < n.state.version.Load(), "version must increase after Increment")
	n.broadcastUpdate()
}
func (n *Node) Decrement() {
	assertions.AssertNotNil(n.state, "node state cannot be nil")
	oldCounter := n.state.counter.Load()
	oldVersion := n.state.version.Load()
	n.state.counter.Add(^uint64(0))
	n.state.version.Add(1)
	assertions.Assert(oldCounter > n.state.counter.Load(), "counter must decrease after Decrease")
	assertions.Assert(oldVersion < n.state.version.Load(), "version must increase after Increment")
	n.broadcastUpdate()
}
func (n *Node) GetCounter() uint64 {
	assertions.AssertNotNil(n.state, "node state cannot be nil")
	return n.state.counter.Load()
}
func (n *Node) GetVersion() uint32 {
	assertions.AssertNotNil(n.state, "node state cannot be nil")
	return n.state.version.Load()
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

These are simple helper methods that provide the core functionality of our distributed counter:

- `Increment()` and `Decrement()` modify the counter value while updating version numbers
- Getter methods (`GetCounter()`, `GetVersion()`, `GetAddr()`) safely access node state
- `Close()` gracefully shuts down the node

Each method includes assertions to ensure data integrity and proper state transitions.

The fun part begins, here's a visual representation of how the periodic state pull works:

```
              PULL STATE FLOW
            ===================

Node A                                 Other Nodes
  |                                       |
  |--- Timer triggers pullState() ---|    |
  |                                  |    |
  |--- 1. Get available peers -------|    |
  |                                  |    |
  |--- 2. Pick random subset --------|    |
  |    (limited by MaxSyncPeers)     |    |
  |                                  |    |
  |--- 3. For each selected peer: ---|    |
  |      Create concurrent tasks     |    |
  |                                  |    |
  |--- 4. Send PULL requests ------->|    |
  |                                  |    |
  |                                  |    | Each peer processes the PULL
  |                                  |    | and responds with a PUSH
  |                                  |    | (handled by handleIncMsg)
  |<-- 5. Receive PUSH responses ----+    |
  |                                  |    |
  |--- 6. Update state if needed ----|    |
  |    (handled by handleIncMsg)     |    |
  |                                  |    |
```

The `pullState` method follows a simple but effective approach:

1. It selects a random subset of peers to query, rather than contacting every node in the network
2. It sends PULL messages to these selected peers in parallel using goroutines
3. Each peer will respond with a PUSH message containing their current state
4. If any peer has a newer version, the node will update itself (handled by `handleIncMsg`)

> **📌 Design Note**: Selecting random peers rather than contacting every node significantly improves network efficiency. This approach reduces overall traffic, distributes load, and makes the system more resilient to failures - core benefits of gossip protocols that enable them to scale to thousands of nodes while maintaining eventual consistency.

Key points about this implementation:

- Random peer selection prevents network hotspots and distributes load
- Concurrent requests ensure efficient synchronization
- Built-in timeout prevents blocking if peers are unresponsive
- The number of peers contacted per sync is configurable via `MaxSyncPeers`
- This periodic synchronization ensures eventual consistency across the network

Let's see the implementation:

```go
func (n *Node) pullState() {
	n.peersMu.RLock()
	peers := n.peers
	n.peersMu.RUnlock()

	if len(peers) == 0 {
		log.Printf("[Node %s] No peers available for sync", n.config.Addr)
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

	for _, peer := range selectedPeers[:numPeers] {
		peerAddr := peer // Shadow the variable for goroutine
		g.Go(func() error {
			log.Printf("[Node %s] Sent message to %s type=%d, version=%d, counter=%d",
				n.config.Addr, peerAddr, protocol.MessageTypePull, n.state.version.Load(), n.state.counter.Load())

			select {
			case n.outgoingMsg <- MessageInfo{
				message: protocol.Message{
					Type:    protocol.MessageTypePull,
					Version: n.state.version.Load(),
					Counter: n.state.counter.Load(),
				},
				addr: peerAddr,
			}:
				return nil
			case <-ctx.Done():
				return ctx.Err()
			}
		})
	}

	if err := g.Wait(); err != nil {
		log.Printf("[Node %s] Sync round failed: %v", n.config.Addr, err)
	}
}
```

The implementation follows these steps:

1. First, we safely retrieve the current peer list using a read lock to avoid race conditions.
2. We select a random subset of peers to query, limited by `MaxSyncPeers`. This involves:
   - Creating a copy of the peers list
   - Shuffling the copy randomly
   - Taking only the first `numPeers` elements
3. We create a timeout context that will expire after half the sync interval, ensuring we don't block indefinitely if peers are unresponsive.
4. For each selected peer, we create a goroutine (using errgroup for coordination) that:
   - Sends a PULL message containing our current version and counter value
5. Finally, we wait for all goroutines to complete and log any errors that occurred during the sync round.

> Consider these optimizations for very large deployments:
>
> - Implement adaptive peer selection based on network topology
> - Use biased sampling to prefer nodes that haven't been contacted recently
> - Apply exponential backoff for repeatedly unresponsive peers
> - Adjust MaxSyncPeers dynamically based on cluster size and network conditions
> - Implement priority-based synchronization where nodes with suspected newer state are contacted first

Let's finalize the node implementation for this part with our `broadcastUpdate`:

```go
func (n *Node) broadcastUpdate() {
	ctx, cancel := context.WithTimeout(n.ctx, n.config.SyncInterval/2)
	defer cancel()
	g, ctx := errgroup.WithContext(ctx)
	n.peersMu.RLock()
	peers := n.peers
	n.peersMu.RUnlock()
	for _, peerAddr := range peers {
		peerAddr := peerAddr // Shadow the variable for goroutine
		g.Go(func() error {
			log.Printf("[Node %s] Sent message to %s type=%d, version=%d, counter=%d",
				n.config.Addr, peerAddr, protocol.MessageTypePush, n.state.version.Load(), n.state.counter.Load())
			select {
			case n.outgoingMsg <- MessageInfo{
				message: protocol.Message{
					Type:    protocol.MessageTypePush,
					Version: n.state.version.Load(),
					Counter: n.state.counter.Load(),
				},
				addr: peerAddr,
			}:
				return nil
			case <-ctx.Done():
				return ctx.Err()
			}
		})
	}
	if err := g.Wait(); err != nil {
		log.Printf("[Node %s] Broadcast update failed: %v", n.config.Addr, err)
	}
}
```

The implementation follows these steps:

1. First, we create a timeout context that will expire after half the sync interval, ensuring operations won't block indefinitely.
2. We safely retrieve the current peer list.
3. For each peer in the list, we create a goroutine that:
   - Sends a PUSH message containing our current version and counter value
4. Finally, we wait for all goroutines to complete and log any errors that occurred during the broadcast.

> **⚠️ Performance Warning**
>
> Unlike `pullState`, this method broadcasts to ALL peers, not just a subset. This can create significant network traffic in large clusters. For production systems with many nodes, consider modifying this to use the same random subset approach as `pullState` or implementing one of the optimization strategies mentioned earlier.

Before we finalize this section let's write some tests to cover critical parts of our node.

Remember the interface we defined earlier for protocol?

```go
type Transport interface {
	Send(addr string, data []byte) error
	Listen(handler func(addr string, data []byte) error) error
	Close() error
}
```

Now, we'll implement an in-memory version of this for testing so we don't have to couple the node implementation with the actual TCP implementation.

```go
// node/node_test.go
type MemoryTransport struct {
	addr    string
	handler func(addr string, data []byte) error
	mu      sync.RWMutex
}

func NewMemoryTransport(addr string) *MemoryTransport {
	return &MemoryTransport{
		addr: addr,
	}
}

func (t *MemoryTransport) Send(addr string, data []byte) error {
	time.Sleep(10 * time.Millisecond) // Prevent message flood
	tmu.RLock()
	transport, exists := transports[addr]
	tmu.RUnlock()
	if !exists {
		return fmt.Errorf("transport not found for address: %s", addr)
	}
	return transport.handler(t.addr, data)
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
```

Let's create a couple of more helpers that will help us throughout this series.

```go
func waitForConvergence(t *testing.T, nodes []*Node, expectedCounter uint64, expectedVersion uint32, timeout time.Duration) {
	deadline := time.Now().Add(timeout)
	for time.Now().Before(deadline) {
		allConverged := true
		for _, n := range nodes {
			if n.state.counter.Load() != expectedCounter || n.state.version.Load() != expectedVersion {
				allConverged = false
				break
			}
		}
		if allConverged {
			return
		}
		time.Sleep(50 * time.Millisecond)
	}
	t.Fatalf("nodes did not converge within timeout. Expected counter=%d, version=%d",
		expectedCounter, expectedVersion)
}

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

These helpers ensure that all nodes in a test converge to the same value within a specified time limit. The `createTestNode` function simplifies test setup by providing a standard way to create nodes for testing.

So, there are some critical cases we have to cover:

1. If nodes can converge to a same value in a very basic form
2. What happens when concurrent updates happen? (Testing conflict resolution)
3. What happens if we send more messages to channels than the node can handle? Are we dropping messages successfully?
4. How well does the system handle more complex network topologies?

```go
func TestNodeBasicOperation(t *testing.T) {
	node1 := createTestNode(t, "node1", 100*time.Millisecond)
	node2 := createTestNode(t, "node2", 100*time.Millisecond)
	node3 := createTestNode(t, "node3", 100*time.Millisecond)

	node1.SetPeers([]string{"node2", "node3"})
	node2.SetPeers([]string{"node1", "node3"})
	node3.SetPeers([]string{"node1", "node2"})

	node1.state.counter.Store(42)
	node1.state.version.Store(1)

	waitForConvergence(t, []*Node{node1, node2, node3}, 42, 1, 2*time.Second)

	node1.Close()
	node2.Close()
	node3.Close()
	time.Sleep(200 * time.Millisecond)
}
```

This test verifies basic eventual consistency. We create 3 nodes, update only the first node, and wait for all nodes to converge to the same value, confirming that state propagates correctly through the network.

```go
func TestConcurrentUpdates(t *testing.T) {
	node1 := createTestNode(t, "node1", 100*time.Millisecond)
	node2 := createTestNode(t, "node2", 100*time.Millisecond)
	node3 := createTestNode(t, "node3", 100*time.Millisecond)

	node1.SetPeers([]string{"node2", "node3"})
	node2.SetPeers([]string{"node1", "node3"})
	node3.SetPeers([]string{"node1", "node2"})

	var wg sync.WaitGroup
	wg.Add(3)

	go func() {
		defer wg.Done()
		node1.state.counter.Store(100)
		node1.state.version.Store(1)
	}()

	go func() {
		defer wg.Done()
		node2.state.counter.Store(200)
		node2.state.version.Store(2)
	}()

	go func() {
		defer wg.Done()
		node3.state.counter.Store(300)
		node3.state.version.Store(3)
	}()

	wg.Wait()
	waitForConvergence(t, []*Node{node1, node2, node3}, 300, 3, 2*time.Second)

	node1.Close()
	node2.Close()
	node3.Close()

	time.Sleep(200 * time.Millisecond)
}
```

This test specifically examines our conflict resolution strategy. We create 3 nodes, then concurrently update each with different values and version numbers, simulating conflicting updates in a distributed system. By checking that all nodes eventually converge to the state with the highest version number (300 with version 3), we verify that our version-based conflict resolution correctly handles simultaneous updates. This is critical in distributed systems where nodes may make conflicting changes without coordination.

```go
func TestMessageDropping(t *testing.T) {
	node1 := createTestNode(t, "node1", 100*time.Millisecond)
	node2 := createTestNode(t, "node2", 100*time.Millisecond)

	node1.SetPeers([]string{"node2"})
	node2.SetPeers([]string{"node1"})

	// Fill up the message buffer to force drops
	for range defaultChannelBuffer + 10 {
		node1.incomingMsg <- MessageInfo{
			message: protocol.Message{
				Type:    protocol.MessageTypePush,
				Version: 1,
				Counter: 100,
			},
			addr: "node2",
		}
	}

	node1.state.counter.Store(500)
	node1.state.version.Store(5)

	waitForConvergence(t, []*Node{node1, node2}, 500, 5, 2*time.Second)

	node1.Close()
	node2.Close()
	time.Sleep(200 * time.Millisecond)
}
```

This test verifies the channel overflow handling by intentionally exceeding the buffer capacity. We confirm that the system properly drops excess messages and still achieves eventual consistency when a new state update occurs. This is critical for system stability under heavy message loads.

```go
func TestRingTopology(t *testing.T) {
	numNodes := 10
	nodes := make([]*Node, numNodes)

	for i := range numNodes {
		addr := fmt.Sprintf("node%d", i)
		transport := NewMemoryTransport(addr)
		config := Config{
			Addr:         addr,
			SyncInterval: 100 * time.Millisecond,
			MaxSyncPeers: numNodes / 2, // To make it converge faster
		}

		node, err := NewNode(config, transport)
		require.NoError(t, err)
		nodes[i] = node
	}

	for i := range numNodes {
		prev := (i - 1 + numNodes) % numNodes
		next := (i + 1) % numNodes
		nodes[i].SetPeers([]string{
			fmt.Sprintf("node%d", prev),
			fmt.Sprintf("node%d", next),
		})
	}

	nodes[0].state.counter.Store(42)
	nodes[0].state.version.Store(1)

	waitForConvergence(t, nodes, 42, 1, 3*time.Second)

	for i := range numNodes {
		nodes[i].Close()
	}
}
```

This is quite interesting because it tests information propagation through a challenging network topology:

```
         node0
           o
          / \
   node9 o   o node1
        /     \
node8 o         o node2
     |           |
node7 o         o node3
     |           |
node6 o         o node4
        \     /
         o---o
         node5
```

In this ring topology:

- Each node connects only to its immediate neighbors (predecessor and successor)
- node0 connects to node9 and node1
- node1 connects to node0 and node2
- ...and so on, forming a complete ring
- node9 connects back to node0, closing the loop
- Information must propagate around the circle through these peer-to-peer connections

This is a challenging topology for distributed systems since information must hop through multiple nodes to reach the opposite side of the ring, and it tests the eventual consistency mechanism effectively. In real-world networks, this verifies that our gossip protocol can handle partial connectivity and still achieve system-wide consistency.

## Conclusion

This marks the end of Part 0 in our distributed counter implementation series. Let's summarize what we've accomplished:

1. We've designed a simple but effective protocol for our gossip-based distributed counter
2. We've implemented the core node logic with proper state management and conflict resolution
3. We've created a transport abstraction that will allow us to easily switch between in-memory and TCP implementations
4. We've written comprehensive tests that verify the system's eventual consistency and fault tolerance

We now have a functioning distributed counter that works within a single process using our in-memory transport. In Part 1, we'll move beyond the in-memory implementation and tackle the TCP and network layer, allowing our nodes to communicate across different processes and machines.

Stay tuned for "Part 1: TCP and Network Layer" where we'll build on this foundation and create a truly distributed counter!

---

## References

- [The Gossip Protocol Explained](https://highscalability.com/gossip-protocol-explained/) - A great introduction to gossip protocols and their applications
- [CAP Theorem](https://en.wikipedia.org/wiki/CAP_theorem) - More information about the tradeoffs in distributed systems

_If you found this post helpful, feel free to share it and check back for the next part in this series. You can also find the complete code for this implementation on [GitHub](https://github.com/ogzhanolguncu/distributed-counter)._
