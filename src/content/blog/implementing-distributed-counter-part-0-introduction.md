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

- **Part 0: CRDT - Implementing a PNCounter (You are here)**
- _Part 1: Node - Structure and In-Memory Communication (Not yet published)_
- _Part 2: Networking - Peer Management and TCP Transport (Not yet published)_
- _Part 3: Finding Peers - The Discovery Service (Not yet published)_
- _Part 4: Adding Persistence - The Write-Ahead Log (WAL) (Not yet published)_
- _Part 5: Finishing Touches - API Gateway (Not yet published)_

In this series of posts, we are going to build a "Distributed Counter" from scratch using Gossip Protocol. Before going forward, let's discuss the motivation for this series.

## Part 0 Goal

In this first post (Part 0), our goal is twofold: first, to introduce the key concepts like Gossip and CRDTs, and second, to implement the PN-Counter in Go. This counter forms the foundation we'll build upon throughout the series.

## Why Distributed Counter and Why This Series

I've been trying to understand how Gossip Protocol is used in real-world distributed systems. To scratch that itch, I needed to find a simple problem to solve so I could focus on the Gossip Protocol itself instead of spending countless hours on some other topic I wasn't familiar with.

So I decided to build a simple counter where you can increment or decrement a number. Since the actual problem is really easy to solve without the distributed part, this allowed me to concentrate on the distributed concepts like:

- How data propagates through the system
- How information persists across nodes
- What happens when a new counter joins our system (cluster)
- How to handle network partitions and node failures
- Implementing eventual consistency in a practical way

### Why a counter specifically?

It's the "Hello World" of distributed systems - simple enough that the core functionality doesn't distract from the distributed challenges, but complex enough to demonstrate real-world issues like:

- Conflict resolution: What happens when two nodes increment simultaneously?
- State convergence: How do we ensure all nodes eventually reach the same count?
- Fault tolerance: How does the system handle nodes going offline and coming back?

### Why this series?

Before I started this series, I had a hard time finding decent material to help me out in my learning journey.
So I thought I ought to make one to help others in their journeys. Then I decided to document this process to give back to the community.
Now that we understand why we're building this distributed counter, let's look at the engine that will drive communication between our nodes: the Gossip Protocol.

## What's Gossip Protocol?

Imagine nodes in a network are people in a closed room. When one person gets information (an "infection"), they don't shout it to everyone. Instead, they randomly tell (gossip to) a few nearby people. Those people then randomly tell a few others. Like an infection spreading, this random P2P sharing eventually ensures everyone in the room (the network) gets the information. This leads to **eventual consistency**. Systems like Cassandra [[1]](https://cassandra.apache.org/doc/latest/cassandra/operating/gossip.html), Consul [[2]](https://developer.hashicorp.com/consul/docs/architecture/gossip) use Gossip protocol for maintaining cluster membership and exchanging state information between nodes.

```ascii
* = Informed Node, O = Uninformed Node

Time 1: Start        Time 2: Spreading      Time 3: Eventual Consistency
+-------+            +-------+            +-------+
| O O O |            | O * O |            | * * * |
| O * O |            | * * * |            | * * * |
| O O O |            | O * O |            | * * * |
+-------+            +-------+            +-------+
```

This shows how information (`*`) starts at one node and gradually spreads through random interactions until all nodes are informed.

Understanding how Gossip propagates state eventually is key. But **eventually** implies trade-offs. Let's analyze these trade-offs using the CAP theorem to see what guarantees our counter system will provide.

## Understanding CAP in Our Distributed Counter

In our distributed counter we'll mainly focus on **AP** (Availability and Partition tolerance) parts of CAP. Why not strong Consistency you may ask? In the CAP theorem, consistency specifically refers to linearizability (sometimes called strong consistency), which is about all nodes seeing the same data at the same time. We don't need this strong consistency for our counter; we need _eventual_ consistency. Our primary concern is ensuring that all nodes (counters) in our cluster (a bunch of counters) converge to the same final value, regardless of the order in which operations occur.

Since the precise operation order isn't critical for a counter - does it really matter if increments and decrements happen in the sequence **4-3-2-1-6**? No. What matters is that all nodes eventually reach the same consistent state.

So, how do we ensure our counter value converges correctly across all nodes even with network partitions and concurrent updates? This is where Conflict-free Replicated Data Types (CRDTs) come in...

## CRDT

### What's a CRDT?

Okay, imagine you and your friend are coloring in the _exact same_ picture, but you're in different rooms. You both have a copy of the blank picture.

1.  **You color the sun yellow.** Your picture now has a yellow sun.
2.  **At the same time, your friend colors the tree green.** Their picture now has a green tree.
3.  **Later, you magically swap copies of your pictures.**

Now what?

- You look at your friend's picture: "Oh, they colored the tree green!" You add the green tree to _your_ picture. Now yours has a yellow sun AND a green tree.
- Your friend looks at your picture: "Oh, they colored the sun yellow!" They add the yellow sun to _their_ picture. Now theirs has a green tree AND a yellow sun.

**Result:** Even though you worked separately and didn't talk while coloring, you both ended up with the **exact same final picture** (yellow sun, green tree).

### Why They Are Needed Here

Let's think about our counters. Imagine we have Node A, Node B, and Node C, all starting with the counter at 0.

They are connected but might not talk to each other instantly (like over a slow or unreliable network).

**Initial State:**

- Node A: Counter = 0
- Node B: Counter = 0
- Node C: Counter = 0

**Concurrent Updates:** Now, two different users interact with the system concurrently:

- User 1 tells Node A: "Increment the counter!" Node A updates its local value: Counter = 1.
- User 2 tells Node B: "Increment the counter!" Node B updates its local value: Counter = 1.
- Node C hasn't received any updates yet: Counter = 0.

**Naive Synchronization Attempt:** The nodes eventually need to sync up. What if they simply exchange their current counter _values_?

1.  Node A sends its value (1) to Node C. Node C updates to 1.
2.  Node B sends its value (1) to Node C. Node C sees the value is already 1, so it stays at 1.
3.  Node A sends its value (1) to Node B. Node B sees its own value is also 1. It might assume no change is needed or simply overwrite its state with the received state (still 1).
4.  Node B sends its value (1) to Node A. Similarly, Node A sees the value matches its own and remains at 1.

**The Incorrect Result:** All nodes converge to a counter value of 1. But this is wrong! Two distinct increment operations occurred (+1 on A, +1 on B). The correct total should be 0 + 1 + 1 = **2**.

**The Problem:** The naive approach of only sharing the _current state_ (the final value on each node) caused us to lose an update. The system didn't preserve the history or the individual _operations_ that led to the state. It just overwrote values with the latest one received. Even simple versioning schemes often fail here, as both Node A and Node B might have performed valid, concurrent updates based on the same initial state (version 0).

**The Solution:** This scenario perfectly illustrates why we need a more sophisticated method. CRDTs are designed precisely for this situation. They define data structures and merge functions that guarantee convergence to a correct state, even when updates happen concurrently and are applied in different orders across replicas, ensuring that no operations are lost.

### PN-Counters

There are different versions of CRDTs, like G-Counter (Grow-Only), PN-Counter (Positive-Negative), and G-Set (Grow-only Set), each serving different purposes. In our implementation, we'll use the PN-Counter. It uses two internal counters: one for increments (P) and one for decrements (N).

The key idea is that each node tracks the P (Positive) and N (Negative) counts originating from every node (including itself) that it knows about. When nodes sync their states, the merge operation combines their knowledge by taking the maximum value seen for each specific node's P count and each specific node's N count.

After merging, the current value of the counter is calculated by summing up all the known P counts from all nodes and subtracting the sum of all the known N counts from all nodes. This process ensures all contributions are counted exactly once, leading to the correct final value even with concurrent updates.

## Implementation Approach

We'll be implementing this distributed counter in Go, which is well-suited for building networked systems due to its excellent concurrency support.

Its standard library also provides robust networking packages that we'll use throughout this series.
Even if you're not familiar with Go, the concepts we'll explore apply broadly to distributed systems development in any language.

### Final system architecture at end of this series

```
                 DISTRIBUTED COUNTER ARCHITECTURE (Final)
                 ========================================
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
                 +-----------------+-----------------+
                 |                                   |
                 v                                   v
+----------------------+<-- DigestPull/Ack/Push -->+----------------------+
|       Node 1         |      (State Sync)        |       Node 2         |
|----------------------|                          |----------------------|
| PNCounter            |                          | PNCounter            |
|  - Increments: {...} |                          |  - Increments: {...} |
|  - Decrements: {...} |                          |  - Decrements: {...} |
| PeerManager          |                          | PeerManager          |
| TCPTransport         |                          | TCPTransport         |
| WAL                  |                          | WAL                  |
+--------+-------------+                          +--------+-------------+
         ^   |                                              ^   |
         |   | HTTP                                         |   | HTTP
         |   v                                              |   v
+--------+-------------+                          +--------+-------------+
| DiscoveryClient      |                          | DiscoveryClient      |
+----------------------+                          +----------------------+
         |   ^                                              |   ^
         |   | Register                                     |   | Register
         |   | Heartbeat                                    |   | Heartbeat
         |   | GetPeers                                     |   | GetPeers
         v   |                                              v   |
+--------------------------------------------------------------------------+
|                            Discovery Server                              |
|--------------------------------------------------------------------------|
| - knownPeers: {"node1_addr": {LastSeen}, "node2_addr": {LastSeen}}       |
| - Endpoints:                                                             |
|   * POST /register                                                       |
|   * POST /heartbeat                                                      |
|   * GET /peers                                                           |
+--------------------------------------------------------------------------+
```

This will be our final architecture and in each post, we'll work towards that goal.

Okay, with the concepts and the final architecture in mind, let's dive into the first piece of code.

## PN-Counter Implementation in Go

Let's setup our directory structure first.

```sh
 crdt/
 ├─ crdt.go
 ├─ crdt_test.go
 ├─ retry.go
```

We'll start with CRDT implementation.

```go
// crdt/crdt.go
type (
	PNMap map[string]uint64

	// RefCountedMap wraps a PNMap with reference counting for Copy-on-Write operations
	RefCountedMap struct {
		data     PNMap
		refCount int32 // Using atomic operations for thread-safe reference counting
	}

	// PNCounter (Positive-Negative Counter) is a conflict-free replicated data type (CRDT)
	// that allows both incrementing and decrementing a counter in a distributed system.
	// This version uses Copy-on-Write with Reference Counting for improved performance.
	PNCounter struct {
		increments atomic.Pointer[RefCountedMap]
		decrements atomic.Pointer[RefCountedMap]
	}
)
```

Before moving forward let's discuss why we do **CoW** and **reference counting**.

---

## References

1.  [Apache Cassandra Documentation](https://cassandra.apache.org/doc/latest/cassandra/operating/gossip.html). _Details on its use of the Gossip Protocol._
2.  [HashiCorp Consul Documentation](https://developer.hashicorp.com/consul/docs/architecture/gossip). _Details on its use of the Gossip Protocol._
3.  [The Gossip Protocol Explained](https://highscalability.com/gossip-protocol-explained/) - A great introduction to gossip protocols and their applications.
4.  [CAP Theorem](https://en.wikipedia.org/wiki/CAP_theorem) - More information about the tradeoffs in distributed systems.
5.  [CRDT](https://pages.lip6.fr/Marc.Shapiro/papers/RR-7687.pdf) - Paper that explains mathematical properties that make CRDTs work reliably

_If you found this post helpful, feel free to share it and check back for the next part in this series. You can also find the complete code for this implementation on [GitHub](https://github.com/ogzhanolguncu/distributed-counter)._
