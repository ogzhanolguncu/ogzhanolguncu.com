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

I've been trying to understand how Gossip Protocol is used in real-world distributed systems. To address that interest, I needed to find a simple problem to solve so I could focus on the Gossip Protocol itself instead of spending countless hours on some other topic I wasn't familiar with.

So I decided to build a simple counter where you can increment or decrement a number. Since the actual problem is really easy to solve without the distributed part, I could focus on the distributed concepts like:

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

In our distributed counter we'll mainly focus on **AP** (Availability and Partition tolerance) parts of CAP. Why not Consistency you may ask? In the CAP theorem, consistency specifically refers to linearizability (sometimes called strong consistency), which is about all nodes seeing the same data at the same time. We don't need this strong consistency for our counter; we need **eventual** consistency. Our primary concern is ensuring that all nodes (counters) in our cluster (a bunch of counters) converge to the same final value, regardless of the order in which operations occur.

Since the precise operation order isn't critical for a counter - does it really matter if increments and decrements happen in the sequence **4-3-2-1-6**? No. What matters is that all nodes eventually reach the same consistent state.

### Implementation Approach

I'll be implementing this distributed counter in Go, which is well-suited for building networked systems due to its excellent concurrency support.
Its standard library also provides robust networking packages that we'll use throughout this series.
Even if you're not familiar with Go, the concepts we'll explore apply broadly to distributed systems development in any language.

We'll also use a bit of [DBC](https://en.wikipedia.org/wiki/Design_by_contract) (Design By Contract), basically we'll do some before and after assertion for our operations.

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

#### Final system architecture

```
                GOSSIP PROTOCOL ARCHITECTURE
                ===========================

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
The first part is all about getting our nodes up and running with static configuration so they can start talking with each other.
Since we don't want to complicate things, we'll run everything in-memory and see how things work.

### Let's Get Started

This will be our end result at the end of this post.

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

We have two types of messages one for sending and one for receiving. In the gossip protocol jargo they are called `pull` and `push`.
Since they are nothing more than identifier about message type 1 byte is quite enough.

```go
const (
	MessageTypePull = 0x01
	MessageTypePush = 0x02
)
```

Our payload will be 13 bytes in total. 1 byte for message type, 4 bytes for version, 8 bytes for our counter value.

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

Now, we need a way to encode and decode these messages before we read or write to TCP. To deterministically parse the []byte, we'll use BigEndian notation. Consistent byte order ensures we'll read and write the same data each time we process it.

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

type Config struct {
	Addr         string
	SyncInterval time.Duration
	MaxSyncPeers int
}

type State struct {
	counter atomic.Uint64
	version atomic.Uint32
}

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

- `Config` is required to bootstrap our node.
- `State` is the current state of our node.
- `MessageInfo` is the payload + address of the node that we send to or receive from

`Node` struct glues everything together. And defines some essential stuff such as ctx for handling cancellation and graceful shutdown,
channels to handle incoming and outgoing traffic and `syncTick` for periodic pull of the state of other nodes. And, finally some helpers for handle peer management which we'll move to separate pkg later on.

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

These are pretty straightforward; they allow us to access peer's information. Only critical part is
locking. Without it we might access inconsistent state data. And since it's read more than it's written we use `RWMutex`.

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

Notice how we are asserting stuff to make sure they are in the boundaries or exists?
When we call our constructor we have to make sure of two things. First, we have to start listining incoming traffic without blocking.
Second, we need a way to control of the flow of our node. There are many ways to do it, but in our case we'll do it with channels.

This is how our `eventLoop` works in a nutshell.

```sh
┌────────────────── EVENT LOOP ──────────────────┐
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
The `select` statement is a crucial part of this method - without it, the code would work synchronously and block the entire thread.
Finally, we send the decoded message to our event loop for processing.

Let's take a closer look at the `eventLoop``, which is the beating heart of our node's message processing system.

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
