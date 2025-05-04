---
pubDatetime: 2025-05-07
title: "Implementing Distributed Counter: Part 2 - Networking"
slug: implementing-distributed-counter-part-2
draft: true
tags:
  - go
  - distributed
  - network_programming
description: "Learn how to implement TCP networking for a distributed counter in Go. This part covers TCP transport implementation with proper framing, peer management refactoring, and shows a working distributed counter cluster communicating over an actual network."
---

This is the third in a series of posts about implementing a distributed counter in Go.

- [Part 0: CRDT - Implementing a PNCounter](https://ogzhanolguncu.com/blog/implementing-distributed-counter-part-0/)
- [Part 1: Node - Structure and In-Memory Communication](https://ogzhanolguncu.com/blog/implementing-distributed-counter-part-1/)
- [Part 2: Networking - Peer Management and TCP Transport](https://ogzhanolguncu.com/blog/implementing-distributed-counter-part-2/) **(You are here)**
- _Part 3: Finding Peers - The Discovery Service (Not yet published)_
- _Part 4: Adding Persistence - The Write-Ahead Log (WAL) (Not yet published)_
- _Part 5: Finishing Touches - API Gateway (Not yet published)_

## Part 2 Goal

Our main goal for part 2 is to implement the TCP version of our Transport interface.
We'll also refactor our `Peer` code to work better with our TCP transport. This part is slimmer than others but serves a crucial role. This marks the first time our nodes will interact with each other over an actual network. In this part, they will communicate directly using static configuration—they'll know each other's addresses. In part 3 we'll have another component in our system to keep track of who's in the network.

---

This part only adds one more component and refactors one. Here's the directory structure we'll be working with:

```
part2/
 ├─ crdt/
 │   ├─ crdt.go
 │   ├─ crdt_test.go
 ├─ assertions/
 │   ├─ assertions.go
 ├─ node/
 │   ├─ node.go
 │   ├─ node_test.go
 │   ├─ peer.go -------------------> REFACTORED
 ├─ protocol/
 │   ├─ message.go
 │   ├─ message_test.go
 │   ├─ tcp.go --------------------> NEW
 │   ├─ tcp_test.go ---------------> NEW
```

## Why TCP for our Transport Layer

I chose TCP over UDP for several key benefits: reliability through built-in acknowledgment, guaranteed ordering and simpler implementation. While high-scale systems often use UDP for performance, TCP provided the right balance of reliability and simplicity for our educational implementation.

## TCP Transport

Before we implement the TCP implementation, let's check our framing structure.

```
+---------------+--------------------+----------------+
| Address Length| Sender Address     | Message Payload|
| (1 byte)      | (variable length)  | (rest of data) |
+---------------+--------------------+----------------+
    byte[0]       bytes[1:1+addrLen]  bytes[1+addrLen:]
```

We previously implemented framing for our encoded messages in [part 1](https://ogzhanolguncu.com/blog/implementing-distributed-counter-part-1/#:~:text=broken%20or%20nonsensical.-,Message%20Framing,-When%20a%20message). Our TCP transport also requires its own framing implementation. This framing structure provides several benefits:

- Maintains consistent node identity regardless of network configurations like NAT or proxies
- The TCP connection's remote address might differ from the node's logical address in the distributed system
- Supports additional metadata for logging and monitoring purposes

```
TCP MESSAGE FLOW BETWEEN NODES
==============================

 +--------+                                 +--------+
 | Node A |                                 | Node B |
 +--------+                                 +--------+
     |                                          |
     |  1. Create Message                       |
     |-------------------+                      |
     |                   |                      |
     |  2. Encode Message|                      |
     |-------------------+                      |
     |                                          |
     |  3. Frame with Address Length            |
     |-------------------+                      |
     |                   |                      |
     |  4. TCP Connect   |                      |
     |----------------------------------------->|
     |                                          |
     |  5. Send Framed Message                  |
     |----------------------------------------->|
     |                                          |
     |                         6. Read Message  |
     |                      +-------------------|
     |                      |                   |
     |                      |  7. Extract Addr  |
     |                      +-------------------|
     |                      |                   |
     |                      |  8. Extract Data  |
     |                      +-------------------|
     |                                          |
     |                     9. Process Message   |
     |                      +-------------------|
     |                      |                   |
     | 10. Response Message |                   |
     |<-----------------------------------------|
     |                                          |
```

## TCP

Now that we understand our TCP payload structure, let's define our constants and constructor.

```go
// part2/protocol/tcp.go
const (
	ReadBufferSize = 16 * 1024 // 16KB buffer for reading
	ReadTimeout    = 5 * time.Second
	WriteTimeout   = 5 * time.Second
	DialTimeout    = 5 * time.Second
)

type TCPTransport struct {
	addr     string
	listener net.Listener
	handler  func(string, []byte) error
	ctx      context.Context
	cancel   context.CancelFunc
	wg       sync.WaitGroup
	logger   *slog.Logger
}

func NewTCPTransport(addr string, logger *slog.Logger) (*TCPTransport, error) {
	assertions.Assert(addr != "", "transport address cannot be empty")

	listener, err := net.Listen("tcp", addr)
	if err != nil {
		return nil, err
	}

	ctx, cancel := context.WithCancel(context.Background())

	if logger == nil {
		logger = slog.New(slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{
			Level: slog.LevelInfo,
		}))
	}

	transportLogger := logger.With("component", "TCPTransport", "addr", addr)

	transport := &TCPTransport{
		addr:     addr,
		listener: listener,
		ctx:      ctx,
		cancel:   cancel,
		logger:   transportLogger,
	}

	assertions.AssertNotNil(transport.listener, "listener must be initialized")
	assertions.AssertNotNil(transport.ctx, "context must be initialized")
	assertions.AssertNotNil(transport.cancel, "cancel function must be initialized")

	return transport, nil
}
```

Similar to our in-memory transport implementation, the TCP version requires additional considerations since network operations are more fragile and costly. The `TCPTransport` tracks its own node identity (e.g., `localhost:9000`), maintains a persistent `net.Listener`, and implements concurrency safeguards.

### Send

```go
func (t *TCPTransport) Send(addr string, data []byte) error {
	assertions.Assert(addr != "", "target address cannot be empty")
	assertions.AssertNotNil(data, "data cannot be nil")
	assertions.Assert(len(data) > 0, "data cannot be empty")
	assertions.Assert(t.addr != "", "transport's own address cannot be empty")
	assertions.Assert(t.addr != addr, "transport cannot send data to itself")

	// Establish connection with timeout
	conn, err := net.DialTimeout("tcp", addr, DialTimeout)
	if err != nil {
		t.logger.Error("connection error", "target", addr, "error", err)
		return err
	}
	defer conn.Close()

	if err := conn.SetWriteDeadline(time.Now().Add(WriteTimeout)); err != nil {
		t.logger.Error("set deadline error", "error", err)
		return err
	}

	// First prepare our address
	addrBytes := []byte(t.addr)
	addrLen := len(addrBytes)

	// Length of the message is: 1 byte (addr length) + address bytes + payload bytes
	totalLen := 1 + addrLen + len(data)

	// Create a single buffer for the complete message to avoid partial writes
	message := make([]byte, totalLen)
	message[0] = byte(addrLen)            // First byte is address length
	copy(message[1:1+addrLen], addrBytes) // Next addrLen bytes are the address
	copy(message[1+addrLen:], data)       // Remaining bytes are the payload

	// Write the entire message
	written, err := conn.Write(message)
	if err != nil {
		t.logger.Error("write error", "target", addr, "error", err)
		return err
	}

	if written != len(message) {
		t.logger.Warn("partial write", "written", written, "total", len(message), "target", addr)
	}

	return nil
}
```

The implementation follows our defined framing structure: the first byte contains the address length, followed by the address itself, and finally the payload data. Timeouts are set to prevent indefinite waiting for responses.

Now, let's implement the code for handling incoming requests.

### Listen

```go
func (t *TCPTransport) Listen(handler func(string, []byte) error) error {
	assertions.AssertNotNil(handler, "handler function cannot be nil")
	assertions.AssertNotNil(t.listener, "listener cannot be nil")
	assertions.AssertNotNil(t.ctx, "context cannot be nil")

	t.handler = handler
	t.wg.Add(1)

	go func() {
		defer t.wg.Done()
		for {
			select {
			case <-t.ctx.Done():
				return
			default:
				// Set deadline to make the listener responsive to cancellation
				deadline := time.Now().Add(1 * time.Second)
				if err := t.listener.(*net.TCPListener).SetDeadline(deadline); err != nil && t.ctx.Err() == nil {
					t.logger.Error("failed to set accept deadline", "error", err)
				}

				conn, err := t.listener.Accept()
				if err != nil {
					if netErr, ok := err.(net.Error); ok && netErr.Timeout() {
						continue // Just a timeout, try again
					}

					if t.ctx.Err() == nil {
						t.logger.Error("error accepting connection", "error", err)
					}
					continue
				}

				go t.handleConn(conn)
			}
		}
	}()

	return nil
}
```

Each time we call `Listen`, we increment our `waitgroup` counter and invoke `handleConn` to decode incoming messages.

**Implementation of `handleConn`**

```go
func (t *TCPTransport) handleConn(conn net.Conn) {
	assertions.AssertNotNil(conn, "connection cannot be nil")
	defer conn.Close()

	// Set read deadline
	if err := conn.SetReadDeadline(time.Now().Add(ReadTimeout)); err != nil {
		t.logger.Error("failed to set read deadline", "remote_addr", conn.RemoteAddr(), "error", err)
		return
	}

	// Create a buffer to read all incoming data
	buf := make([]byte, ReadBufferSize)
	n, err := conn.Read(buf)
	if err != nil {
		if err != io.EOF {
			t.logger.Error("read error", "remote_addr", conn.RemoteAddr(), "error", err)
		}
		return
	}

	if n == 0 {
		return
	}

	if n < 2 { // Need at least 1 byte for address length + 1 byte of address
		t.logger.Error("message too short", "remote_addr", conn.RemoteAddr(), "bytes", n)
		return
	}

	addrLen := int(buf[0]) // Get address length from first byte
	if addrLen == 0 || addrLen > 255 || 1+addrLen >= n {
		t.logger.Error("invalid address length", "remote_addr", conn.RemoteAddr(), "addr_len", addrLen)
		return
	}

	senderAddr := string(buf[1 : 1+addrLen]) // Extract address from bytes 1 to 1+addrLen-1
	if len(senderAddr) == 0 {
		t.logger.Error("empty sender address")
		return
	}

	// Extract payload (everything after the address)
	payload := buf[1+addrLen : n] // Starting at index 1+addrLen
	if len(payload) == 0 {
		return
	}

	// Invoke the handler with the sender address and payload
	if t.handler != nil {
		if err := t.handler(senderAddr, payload); err != nil {
			t.logger.Error("handler error", "sender", senderAddr, "error", err)
		}
	}
}
```

The `handleConn` method processes incoming connections by extracting data according to our framing structure. It validates the message meets minimum size requirements, parses the address length from the first byte, and extracts both the sender's address and payload. After successful validation, it passes the sender address and payload to the callback.

Let's complete our TCP implementation with the Close method.

## Close

```go
func (t *TCPTransport) Close() error {
	assertions.AssertNotNil(t.cancel, "cancel function cannot be nil")
	assertions.AssertNotNil(t.ctx, "context cannot be nil")

	t.logger.Info("closing transport")
	t.cancel()
	if t.listener != nil {
		t.listener.Close()
	}
	t.wg.Wait()

	return nil
}
```

Now let's test our implementation to ensure it functions correctly. We'll cover edge cases like connection refusals, concurrent connections, and basic message exchange between sender and receiver.

```go
// part2/protocol/tcp_test.go

package protocol

import (
	"sync"
	"testing"
	"time"

	"github.com/stretchr/testify/require"
)

// Tests proper message delivery between sender and receiver with payload integrity verification
func TestTCPTransport_Basic(t *testing.T) {
	receiver, err := NewTCPTransport("127.0.0.1:0", nil)
	require.NoError(t, err)
	received := make(chan []byte, 1)

	err = receiver.Listen(func(addr string, data []byte) error {
		received <- data
		return nil
	})
	require.NoError(t, err, "Failed to start receiver")

	actualAddr := receiver.listener.Addr().String()
	sender, err := NewTCPTransport("127.0.0.1:0", nil)
	require.NoError(t, err)
	testData := []byte("hello world")

	err = sender.Send(actualAddr, testData)
	require.NoError(t, err, "Failed to send data")

	select {
	case receivedData := <-received:
		require.Equal(t, testData, receivedData, "Received data mismatch")
	case <-time.After(5 * time.Second):
		require.Fail(t, "Timeout waiting for data")
	}

	require.NoError(t, receiver.Close())
	require.NoError(t, sender.Close())
}

// Tests graceful handling of unreachable nodes, ensuring the transport properly reports connection failures
func TestTCPTransport_ConnectionRefused(t *testing.T) {
	sender, err := NewTCPTransport("127.0.0.1:0", nil)
	require.NoError(t, err)

	err = sender.Send("127.0.0.1:44444", []byte("test"))
	require.Error(t, err, "Expected error when sending to non-existent port")

	require.NoError(t, sender.Close())
}

// Validates that the transport can handle concurrent connections
func TestTCPTransport_ConcurrentConnections(t *testing.T) {
	receiver, err := NewTCPTransport("127.0.0.1:0", nil)
	require.NoError(t, err)

	receivedCount := 0
	var mu sync.Mutex

	err = receiver.Listen(func(addr string, data []byte) error {
		mu.Lock()
		receivedCount++
		mu.Unlock()
		return nil
	})
	require.NoError(t, err, "Failed to start receiver")

	actualAddr := receiver.listener.Addr().String()
	const numMessages = 10
	var wg sync.WaitGroup

	for range numMessages {
		wg.Add(1)
		go func() {
			defer wg.Done()
			sender, err := NewTCPTransport("127.0.0.1:0", nil)
			require.NoError(t, err)
			err = sender.Send(actualAddr, []byte("test"))
			require.NoError(t, err, "Failed to send")
			require.NoError(t, sender.Close())
		}()
	}

	wg.Wait()
	time.Sleep(time.Second)

	mu.Lock()
	require.Equal(t, numMessages, receivedCount, "Message count mismatch")
	mu.Unlock()

	require.NoError(t, receiver.Close())
}
```

## Peer Manager

For this part, we need to restructure our peer management implementation to better support upcoming functionality. We'll create a dedicated `peer` package instead of including it in the `node` package. We'll modify the `SetPeers` method from part 1 to use `AddPeer` for more granular control.

### Adding Peer

```go
// part2/peer/peer.go
type Peer struct {
	Addr string
}

type PeerManager struct {
	peers map[string]*Peer
	mu    sync.RWMutex
}

func NewPeerManager() *PeerManager {
	pm := &PeerManager{
		peers: make(map[string]*Peer),
	}

	assertions.AssertNotNil(pm.peers, "peers map must be initialized")

	return pm
}


func (pm *PeerManager) AddPeer(addr string) {
	assertions.Assert(addr != "", "peer address cannot be empty")
	assertions.AssertNotNil(pm.peers, "peers map cannot be nil")

	pm.mu.Lock()
	defer pm.mu.Unlock()

	pm.peers[addr] = &Peer{Addr: addr}

	assertions.AssertNotNil(pm.peers[addr], "peer must exist after adding")
}
```

The `AddPeer` method is similar to `SetPeers` but maintains an ongoing list of peers in the manager rather than replacing the entire collection each time.

### Removing Peer

```go
func (pm *PeerManager) RemovePeer(addr string) {
	assertions.Assert(addr != "", "peer address cannot be empty")
	assertions.AssertNotNil(pm.peers, "peers map cannot be nil")

	pm.mu.Lock()
	defer pm.mu.Unlock()

	delete(pm.peers, addr)

	assertions.Assert(pm.peers[addr] == nil, "peer must not exist after removal")
}
```

The `RemovePeer` method is primarily needed for testing node connections.

### Getting Peers

```go
func (pm *PeerManager) GetPeers() []string {
	assertions.AssertNotNil(pm.peers, "peers map cannot be nil")

	pm.mu.RLock()
	defer pm.mu.RUnlock()

	peers := make([]string, 0, len(pm.peers))
	for addr := range pm.peers {
		assertions.Assert(addr != "", "stored peer address cannot be empty")
		peers = append(peers, addr)
	}

	assertions.AssertEqual(len(peers), len(pm.peers), "returned peers slice must contain all peers")

	return peers
}
```

This method returns the complete list of saved peers for the node.

Finally, we need to update our `Node` constructor to support logging and provide access to the peer manager.

```go
// part2/node/node.go
// Add logger parameter
func NewNode(config Config, transport protocol.Transport, peerManager *peer.PeerManager, logger *slog.Logger) (*Node, error) {
	// ..
    // ..
    // Add logger initialization
	if logger == nil {
		logger = slog.New(slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{
			Level: slog.LevelInfo,
		}))
	}

	nodeLogger := logger.With("component", "NODE", "addr", config.Addr)

	node := &Node{
		config:    config,
		counter:   crdt.New(config.Addr),
		peers:     peerManager,
		logger:    nodeLogger, // Use node-specific logger
		ctx:       ctx,
		cancel:    cancel,
		transport: transport,

		incomingMsg:  make(chan MessageInfo, defaultChannelBuffer),
		outgoingMsg:  make(chan MessageInfo, defaultChannelBuffer),
		syncTick:     time.NewTicker(config.SyncInterval).C,
		fullSyncTick: time.NewTicker(config.FullSyncInterval).C, // Initialize full sync ticker
	}

    // Rest remains unchanged
}
```

We also need to implement a method to access the peer manager from outside:

```go
func (n *Node) GetPeerManager() *peer.PeerManager {
	assertions.AssertNotNil(n.peers, "peer manager cannot be nil")
	return n.peers
}
```

This `GetPeerManager` provides external access to the peer manager. An alternative design would be to pass the peer manager as an argument from outside, similar to the logger implementation.

## Running the Distributed Counter Network

Up until now our nodes communicated through memory, but now we have required pieces to make it communicate over the actual network. Let's create our entry file to see it in action.

```go
// part2/main.go
package main

import (
	"fmt"
	"log"
	"log/slog"
	"math/rand"
	"os"
	"sync"
	"time"

	"github.com/ogzhanolguncu/distributed-counter/part2/node"
	"github.com/ogzhanolguncu/distributed-counter/part2/peer"
	"github.com/ogzhanolguncu/distributed-counter/part2/protocol"
)

const (
	numNodes      = 10
	basePort      = 9000
	testDuration  = 10 * time.Second
	operationRate = 100 * time.Millisecond
)

func main() {
	var (
		expectedValue int64
		increments    int64
		decrements    int64
		metricsLock   sync.Mutex
	)

	logger := slog.New(slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{
		Level: slog.LevelError,
	}))

	fmt.Println("=== DISTRIBUTED COUNTER ===")

	// Create nodes
	nodes := make([]*node.Node, numNodes)
	for i := range numNodes {
		addr := fmt.Sprintf("127.0.0.1:%d", basePort+i)
		transport, err := protocol.NewTCPTransport(addr, logger)
		if err != nil {
			log.Fatalf("Failed to create transport: %v", err)
		}

		n, err := node.NewNode(node.Config{
			Addr:         addr,
			SyncInterval: 500 * time.Millisecond,
			MaxSyncPeers: 5,
			LogLevel:     slog.LevelError,
		}, transport, peer.NewPeerManager(), logger)
		if err != nil {
			log.Fatalf("Failed to create node: %v", err)
		}
		nodes[i] = n
	}
	fmt.Printf("Created %d nodes\n", numNodes)

	// Connect all nodes (full mesh topology)
	for i, node := range nodes {
		pm := node.GetPeerManager()
		for j, peer := range nodes {
			if i != j {
				pm.AddPeer(peer.GetAddr())
			}
		}
	}
	fmt.Println("Connected all nodes in a full mesh")

	// Run concurrent operations
	stopChan := make(chan struct{})
	var wg sync.WaitGroup

	// Start concurrent increment/decrement operations
	fmt.Println("Starting operations...")
	for i := range numNodes {
		wg.Add(1)
		go func(nodeIndex int) {
			defer wg.Done()

			ticker := time.NewTicker(operationRate)
			defer ticker.Stop()

			for {
				select {
				case <-ticker.C:
					// Randomly increment or decrement
					if rand.Intn(2) == 0 {
						nodes[nodeIndex].Increment()
						metricsLock.Lock()
						expectedValue++
						increments++
						metricsLock.Unlock()
					} else {
						nodes[nodeIndex].Decrement()
						metricsLock.Lock()
						expectedValue--
						decrements++
						metricsLock.Unlock()
					}
				case <-stopChan:
					return
				}
			}
		}(i)
	}

	// Run the test for specified duration
	fmt.Printf("Running test for %v...\n", testDuration)
	time.Sleep(testDuration)

	// Stop operations
	close(stopChan)
	fmt.Println("Test complete. Waiting for final synchronization...")

	// Wait for nodes to finish syncing
	time.Sleep(3 * time.Second)
	wg.Wait()

	// Final results
	fmt.Println("\n=== FINAL RESULTS ===")

	metricsLock.Lock()
	finalExpected := expectedValue
	finalIncs := increments
	finalDecs := decrements
	metricsLock.Unlock()

	fmt.Printf("Operations: %d increments, %d decrements\n", finalIncs, finalDecs)
	fmt.Printf("Expected value: %d\n", finalExpected)

	// Check if nodes converged
	fmt.Println("Node values:")
	allSame := true
	firstValue := nodes[0].GetCounter()

	for i, node := range nodes {
		value := node.GetCounter()
		fmt.Printf("Node %d: %d\n", i, value)

		if value != firstValue {
			allSame = false
		}
	}

	// Print convergence status
	if allSame {
		fmt.Printf("\nSUCCESS: All nodes converged to %d\n", firstValue)
		if firstValue == finalExpected {
			fmt.Println("PERFECT: Value matches expected count!")
		} else {
			fmt.Printf("PARTIAL: Nodes converged but to unexpected value (expected %d, got %d)\n",
				finalExpected, firstValue)
		}
	} else {
		fmt.Println("\nFAILURE: Nodes did not converge to the same value")
	}

	// Shutdown
	fmt.Println("\nShutting down...")
	for i, n := range nodes {
		if err := n.Close(); err != nil {
			log.Printf("Error closing node %d: %v", i, err)
		}
	}
	fmt.Println("All components shut down successfully")
}
```

This code creates a network of 10 nodes in a full mesh topology. Each node runs on a different port starting from 9000. The nodes perform random increment and decrement operations for 10 seconds, then wait for synchronization to complete. Finally, it verifies that all nodes have converged to the same counter value.

---

## Conclusion

In this third part of the series, we've built the TCP version of our transport protocol. We started by defining a proper framing for TCP payloads and made sure it handles network issues by properly logging them to us. We made some changes to our peer manager for upcoming parts.

We can now have a functioning Distributed Counter Cluster with static configuration and finally see the nodes communicate through an actual network.

_If you found this post helpful, feel free to share it and check back for the next part in this series. You can also find the complete code for this implementation on [GitHub](https://github.com/ogzhanolguncu/distributed-counter/part2)._
