---
pubDatetime: 2025-04-02
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

Before I started this series, I had a hard time finding decent material to help me in my learning journey. So I thought I ought to create one to help others on their journeys. I decided to document this process to give back to the community.

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
const maxRetryCount = 50

type (
	PNMap map[string]uint64

	// RefCountedMap wraps a PNMap with reference counting for Copy-on-Write operations
	RefCountedMap struct {
		data     PNMap
		refCount int32 // Using atomic operations for thread-safe reference counting
	}

	// MapPool provides recycling of maps to reduce allocation pressure
	MapPool struct {
		pool sync.Pool
	}

	// PNCounter (Positive-Negative Counter) is a conflict-free replicated data type (CRDT)
	// that allows both incrementing and decrementing a counter in a distributed system.
	PNCounter struct {
		increments atomic.Pointer[RefCountedMap]
		decrements atomic.Pointer[RefCountedMap]
		mapPool    *MapPool
	}
)
```

Let's discuss the whats and whys of **CoW**(Copy-on-Write), **CAS**(Compare and Swap), Object Pooling and Ref Counting. I know we've discussed quite a bit of theory but, bear with me, we just need a bit more.

First question we have to ask: why do we bother dealing with all these when we could just use locks and maps? Well, since our app is going to be highly concurrent, locking around increments, decrements, or merges would serialize all write access. Only one goroutine could modify the counter state at a time. Imagine we have 100 nodes talking to each other, updating and reading - due to high contention our app would slow down (in theory). So, that's why we'll implement a lock-free design using atomics.

### Compare and Swap

CAS is an atomic operation used in concurrent programming to ensure thread-safe updates without using locks. Here's how it works:

#### Basic Concept of CAS

CAS takes three parameters:

1. Memory location (address)
2. Expected value
3. New value

The operation atomically:

- Checks if the memory location contains the expected value
- If it does, replaces it with the new value and returns true
- If it doesn't, returns false (the operation fails)

#### Successful CAS Operation

```
Memory Address X initially holds value 100

Thread wants to change value from 100 to 200 using CAS(X, 100, 200)

Step 1: Read memory location
┌───────────────┐
│ Memory Addr X │
├───────────────┤
│      100      │
└───────────────┘

Step 2: Compare current value (100) with expected value (100)
┌───────────────┐    ┌───────────────┐
│ Memory Addr X │    │ Expected Value│
├───────────────┤ == ├───────────────┤  ✓ They match!
│      100      │    │      100      │
└───────────────┘    └───────────────┘

Step 3: Since they match, update to new value (atomic operation)
┌───────────────┐
│ Memory Addr X │
├───────────────┤
│      200      │ ← Updated!
└───────────────┘

Result: CAS returns true, operation successful
```

#### Failed CAS Operation

```
Memory Address X initially holds value 101

Thread wants to change value from 100 to 200 using CAS(X, 100, 200)

Step 1: Read memory location
┌───────────────┐
│ Memory Addr X │
├───────────────┤
│      101      │
└───────────────┘

Step 2: Compare current value (101) with expected value (100)
┌───────────────┐    ┌───────────────┐
│ Memory Addr X │    │ Expected Value│
├───────────────┤ != ├───────────────┤  ✗ They don't match!
│      101      │    │      100      │
└───────────────┘    └───────────────┘

Step 3: No update performed, memory remains unchanged
┌───────────────┐
│ Memory Addr X │
├───────────────┤
│      101      │ ← Unchanged
└───────────────┘

Result: CAS returns false, operation failed
```

Benefits are entire operation is atomic(indivisible unit), if a thread fails CAS can immediately go back to other work and no deadlocks. Trade off is a bit more tricky to get it right and set up.

### Copy-on-Write

The copy-on-write approach is a strategy for concurrent data structure modifications that avoids locking while ensuring consistency. Here's how it works:

Instead of modifying data in place (which would require locks), you:

1. Create a complete copy of the data
2. Make changes to the copy
3. Atomically swap the reference to point to the new copy with CAS as we explained above.

#### Example with PNCounter

Let's imagine a simplified counter with two nodes "A" and "B":

```
Initial state:
┌─────────────────┐
│ Pointer         │──┐
└─────────────────┘  │
                     ▼
                   ┌─────────────┐
                   │ Map         │
                   │ "A": 5      │
                   │ "B": 3      │
                   └─────────────┘
```

#### Thread 1 wants to increment node "A"

```
Step 1: Read current map
┌─────────────────┐
│ Pointer         │──┐
└─────────────────┘  │
                     ▼
                   ┌─────────────┐
                   │ Map         │
                   │ "A": 5      │
                   │ "B": 3      │
                   └─────────────┘

Step 2: Create a new copy with changes
┌─────────────────┐
│ Pointer         │──┐
└─────────────────┘  │
                     ▼
                   ┌─────────────┐     ┌─────────────┐
                   │ Map         │     │ New Map     │
                   │ "A": 5      │     │ "A": 6      │
                   │ "B": 3      │     │ "B": 3      │
                   └─────────────┘     └─────────────┘

Step 3: Atomically swap pointer
┌─────────────────┐
│ Pointer         │──┐
└─────────────────┘  │
                     │                 ┌─────────────┐
                     │                 │ Map (old)   │
                     │                 │ "A": 5      │
                     │                 │ "B": 3      │
                     │                 └─────────────┘
                     ▼
                   ┌─────────────┐
                   │ New Map     │
                   │ "A": 6      │
                   │ "B": 3      │
                   └─────────────┘
```

#### When Concurrent Updates Happen

Let's say Thread 2 is also trying to increment node "B" at the same time:

```
Thread 1 and Thread 2 both read the initial state
┌─────────────────┐
│ Pointer         │──┐
└─────────────────┘  │
                     ▼
                   ┌─────────────┐
                   │ Map         │
                   │ "A": 5      │
                   │ "B": 3      │
                   └─────────────┘

Thread 1 creates a new map         Thread 2 creates a new map
┌─────────────┐                    ┌─────────────┐
│ New Map T1  │                    │ New Map T2  │
│ "A": 6      │                    │ "A": 5      │
│ "B": 3      │                    │ "B": 4      │
└─────────────┘                    └─────────────┘

Thread 1 succeeds with CAS
┌─────────────────┐
│ Pointer         │──┐
└─────────────────┘  │
                     ▼
                   ┌─────────────┐
                   │ New Map T1  │
                   │ "A": 6      │
                   │ "B": 3      │
                   └─────────────┘

Thread 2's CAS fails (pointer changed)
```

Since Thread 2's CAS fails, it must:

```
1. Read the current state again
┌─────────────────┐
│ Pointer         │──┐
└─────────────────┘  │
                     ▼
                   ┌─────────────┐
                   │ Map         │
                   │ "A": 6      │ ← (Thread 1's update)
                   │ "B": 3      │
                   └─────────────┘

2. Create another new map
┌─────────────┐
│ New Map T2  │
│ "A": 6      │ ← (Preserves Thread 1's update)
│ "B": 4      │ ← (Thread 2's update)
└─────────────┘

3. Try CAS again
```

### Object Pooling

Object pooling is a technique to create temporary objects for temporary uses to reduce memory footprint of the program.

> Any item stored in the Pool may be removed automatically at any time without notification. If the Pool holds the only reference when this happens, the item might be deallocated.

In our implementation, it will be required for creating temporary increment and decrement maps when doing CoW. Remember the `Copy` of CoW? We have to make new copies of maps before swapping their pointers. If CAS fails, we have to put them back in the pool and let another goroutine use it. If CAS succeeds, we'll let GC clean up the old map.

```ascii
            SYNC.POOL RECYCLING MECHANISM
            =============================

┌───────────────────────────────────────────────────┐
│                    Application                    │
└───────────┬─────────────────────────┬─────────────┘
            │                         │
            │ Get                     │ Put
            │                         │
            ▼                         │
┌───────────────────┐       ┌─────────────────────┐
│   Need a Map?     │       │   Done with Map?    │
└───────┬───────────┘       └──────────┬──────────┘
        │                              │
        ▼                              │
┌───────────────────┐                  │
│  sync.Pool.Get()  │                  │
└───────┬───────────┘                  │
        │                              │
        ▼                              │
┌───────────────────┐                  │
│ Check Pool Cache  │                  │
└───────┬───────────┘                  │
        │                              │
        ▼                              │
┌───────────────────┐ No     ┌─────────────────────┐
│   Map Available?  ├────────►  Allocate New Map   │
└───────┬───────────┘        └──────────┬──────────┘
        │ Yes                           │
        │                               │
        ▼                               │
┌───────────────────┐                   │
│ Return Cached Map │                   │
└───────┬───────────┘                   │
        │                               │
        │                               │
        │      ┌─────────────────────┐  │
        └─────►│   Use Map in App    │◄─┘
               └──────────┬──────────┘
                          │
                          │
                          ▼
               ┌─────────────────────┐
               │ sync.Pool.Put(map)  │
               └──────────┬──────────┘
                          │
                          ▼
               ┌─────────────────────┐
               │ Add to Pool Cache   │ ─┐
               └─────────────────────┘  │
                          ▲             │
                          │             │
                          └─────────────┘
                         (Ready for reuse)
```

### Reference Counting

Reference counting is a technique we use to safely manage shared resources in our lock-free implementation. Each `RefCountedMap` has an atomic counter that tracks how many operations are currently using it.

```ascii
            REFERENCE COUNTING LIFECYCLE
            ===========================

Initial State (refCount = 1)
┌─────────────────────────────┐
│ Map (refCount = 1)          │◄───── Pointer
│                             │
│ - Only owner is the pointer │
└─────────────────────────────┘


During Read Operations (Acquire)
┌─────────────────────────────┐
│ Map (refCount = 3)          │◄───── Pointer
│                             │
│ - Pointer reference         │       ┌─────────────┐
│ - Reader 1                  │◄──────┤ Reader 1    │
│ - Reader 2                  │◄──────┤ Reader 2    │
└─────────────────────────────┘       └─────────────┘


During Update (CoW)
┌─────────────────────────────┐        ┌─────────────────────────────┐
│ Old Map (refCount = 3)      │        │ New Map (refCount = 1)      │
│                             │        │                             │
│ - Old pointer reference     │        │                             │
│ - Reader 1                  │◄─────  │                             │
│ - Reader 2                  │◄─────  │                             │
└─────────────────────────────┘        └─────────────────────────────┘
        ▲                                        ▲
        │                                        │
        │                                        │
        └── Old Pointer                          └── New Pointer
                                                    (After CAS)


After Readers Complete (Release)
┌─────────────────────────────┐        ┌─────────────────────────────┐
│ Old Map (refCount = 0)      │        │ New Map (refCount = 1)      │
│                             │        │                             │
│ - No more references        │        │ - Pointer reference         │
│ - Ready for GC              │        │                             │
└─────────────────────────────┘        └─────────────────────────────┘
                                                    ▲
                                                    │
                                                    │
                                                    └── Current Pointer
```

When readers need to access the map's data, they increment the reference count to prevent the map from being destroyed while they're using it. After they finish, they decrement the count.

During updates, we create a new map and swap the pointer to it. The old map isn't immediately destroyed - it remains alive until all readers are done with it. Once its reference count reaches zero and no pointers point to it, the garbage collector can reclaim its memory.

## Enough theory, let's code already!

Now that we understand the core concepts behind our distributed counter (CRDT, CAS, CoW, Object Pooling, and Reference Counting), let's implement the PNCounter in Go.

Let's define our `RefCountedMap` first:

```go
// NewRefCountedMap creates a new map with an initial reference count of 1
func NewRefCountedMap() *RefCountedMap {
	return &RefCountedMap{
		data:     make(PNMap),
		refCount: 1, // Start with 1 reference
	}
}

// Acquire increments the reference count
func (r *RefCountedMap) Acquire() { atomic.AddInt32(&r.refCount, 1) }

// Release decrements the reference count
func (r *RefCountedMap) Release() {
	atomic.AddInt32(&r.refCount, -1) // GC will collect the map when refCount is zero and it's unreachable.
}
```

When operations read the map, they call `Acquire()` to ensure the map isn't cleaned up while they're using it. After they're done, they call `Release()`. When we swap pointers in our CAS operations, the old map's reference count eventually drops to zero when all readers finish, allowing it to be garbage collected.

> Note the use of `atomic` operations for incrementing and decrementing the reference count. These ensure that our reference counting operations are thread-safe without requiring locks - maintaining our lock-free design philosophy throughout the implementation. Without atomics, concurrent Acquire/Release operations could lead to race conditions where the count might be incorrectly tracked.

Now, let's add our `MapPool`:

```go
// NewMapPool creates a new map pool
func NewMapPool() *MapPool {
	return &MapPool{
		pool: sync.Pool{
			New: func() any {
				return &RefCountedMap{
					data:     make(PNMap),
					refCount: 1,
				}
			},
		},
	}
}

// Get retrieves a map from the pool or creates a new one
func (p *MapPool) Get() *RefCountedMap {
	return p.pool.Get().(*RefCountedMap)
}

// Put returns a map to the pool for reuse, ensuring it's cleaned first.
func (p *MapPool) Put(m *RefCountedMap) {
    // CRITICAL: Clear the map data before returning to the pool.
    // sync.Pool might reuse this map later, and we don't want stale data.
    clear(m.data) // Keeps the underlying allocated memory but removes entries.

    // CRITICAL: Reset the reference count. When Get retrieves this,
    // it should have a fresh refCount of 1, representing the new owner.
    atomic.StoreInt32(&m.refCount, 1)

    // Return the cleaned map to the pool.
    p.pool.Put(m)
}
```

One crucial detail when using `sync.Pool` with objects that hold state is cleaning them up before putting them back. In our `Put` method, we must `clear(m.data)` to remove any old key-value pairs. Otherwise, the next time `Get` retrieves this map instance, it might contain stale data from a previous operation. Equally important is resetting the `refCount` to 1 using `atomic.StoreInt32`, ensuring that any map retrieved from the pool starts with the correct initial reference count for its new temporary owner.

Let's define our constructor for `PNCounter`:

```go
// New creates a new PNCounter with the provided node ID
func New(nodeId string) *PNCounter {
	c := &PNCounter{
		mapPool: NewMapPool(),
	}

	incMap := NewRefCountedMap()
	incMap.data[nodeId] = 0
	c.increments.Store(incMap)

	decMap := NewRefCountedMap()
	decMap.data[nodeId] = 0
	c.decrements.Store(decMap)

	return c
}
```

Let's define our retrieval functions:

```go
// Value returns the current value of the counter (increments - decrements)
func (p *PNCounter) Value() int64 {
	increments := p.increments.Load()
	increments.Acquire()
	defer increments.Release()

	decrements := p.decrements.Load()
	decrements.Acquire()
	defer decrements.Release()

	var incSum, decSum uint64
	for _, v := range increments.data {
		incSum += v
	}
	for _, v := range decrements.data {
		decSum += v
	}

	return int64(incSum) - int64(decSum)
}

// LocalValue returns the net value for a specific node
func (p *PNCounter) LocalValue(nodeId string) int64 {
	increments := p.increments.Load()
	increments.Acquire()
	defer increments.Release()

	decrements := p.decrements.Load()
	decrements.Acquire()
	defer decrements.Release()

	var incSum, decSum uint64
	if val, ok := increments.data[nodeId]; ok {
		incSum = val
	}

	if val, ok := decrements.data[nodeId]; ok {
		decSum = val
	}

	return int64(incSum) - int64(decSum)
}
```

These two functions are highly similar: `Value()` returns the counter's overall total value, while `LocalValue()` returns the net value contributed by a specific node. The crucial aspect in both is the use of `Acquire()` and `Release()` when accessing the internal maps. This prevents race conditions that might otherwise cause reads of inconsistent or stale data if another thread concurrently modifies the counter's state.

Let's implement our `Increment` and `Decrement`:

```go
// Increment atomically increments the counter for the specified node using CoW and CAS.
func (p *PNCounter) Increment(nodeId string) int64 {
	// Setup retry logic (implementation details omitted for now)
	retry := &Retry[int64]{
		MaxAttempts: maxRetryCount,
		Delay:       1 * time.Millisecond,
	}

	// Execute the increment logic within the retry loop
	return retry.Do(func() RetryResult[int64] {
		// [Step 1]
		currentMap := p.increments.Load() // Atomically load the pointer

		// [Step 2]
		newMap := p.mapPool.Get() // Get a map from the pool

		// [Step 3]
		maps.Copy(newMap.data, currentMap.data) // Copy data (CoW)

		// [Step 4]
		if _, exists := newMap.data[nodeId]; !exists {
			newMap.data[nodeId] = 0
		}
		newMap.data[nodeId]++ // Apply increment to the new map

		// [Step 5]
		if p.increments.CompareAndSwap(currentMap, newMap) { // Attempt atomic swap (CAS)
			// [Step 5a - Success]
			currentMap.Release() // Release pointer's hold on the old map
			return RetryResult[int64]{Value: p.Value(), Done: true}
		}

		// [Step 5b - Failure]
		p.mapPool.Put(newMap) // Return unused map to the pool
		return RetryResult[int64]{Value: p.Value(), Done: false}
	}) // Retry mechanism handles looping if Done == false
}
```

Here's the breakdown of the Increment logic, performed within a retry loop:

1.  **[Step 1] Load Current Map Pointer:** We first atomically load the pointer (`p.increments.Load()`) that currently points to the increments map.
2.  **[Step 2] Get Reusable Map:** Then, we get a temporary map instance (`newMap`) from our object pool (`p.mapPool.Get()`).
3.  **[Step 3] Copy Data (The "Copy" in CoW):** We copy the data from the map we loaded in Step 1 (`currentMap`) into our temporary map (`newMap`). This is the essential **Copy** part of the **Copy-on-Write** pattern.
4.  **[Step 4] Apply Increment:** We perform the increment operation for the specified `nodeId` directly on the `newMap` (our copy).
5.  **[Step 5] Attempt Atomic Swap (The "Write" via CAS):** We try to atomically swap the main pointer (`p.increments`) using **Compare-and-Swap** (`CompareAndSwap`). This operation checks if `p.increments` still points to `currentMap` (the pointer from Step 1) and, if so, updates it to point to `newMap`.
    - **[Step 5a - Success]:** If the CAS succeeds, our `newMap` is now the active increments map. We call `Release()` on the `currentMap` (the old map) to decrement its reference count, allowing it to be garbage collected later when no longer referenced. The increment operation is complete.
    - **[Step 5b - Failure]:** If the CAS fails, it means another concurrent operation updated the `p.increments` pointer between our Step 1 and Step 5. Our `newMap` is now based on outdated information. We return this unused `newMap` back to the pool (`p.mapPool.Put(newMap)`) and signal that this attempt failed.

```go
// Decrement atomically increments the *decrement* count for the specified node using CoW and CAS.
func (p *PNCounter) Decrement(nodeId string) int64 {
	// Setup retry logic
	retry := &Retry[int64]{
		MaxAttempts: maxRetryCount, // Define this constant elsewhere (e.g., 3)
		Delay:       1 * time.Millisecond,
	}

	// Execute the decrement logic within the retry loop
	return retry.Do(func() RetryResult[int64] {
		// [Step 1]
		currentMap := p.decrements.Load() // Atomically load the pointer to the *decrements* map

		// [Step 2]
		newMap := p.mapPool.Get() // Get a map from the pool

		// [Step 3]
		maps.Copy(newMap.data, currentMap.data) // Copy data (CoW)

		// [Step 4]
		if _, exists := newMap.data[nodeId]; !exists {
			newMap.data[nodeId] = 0
		}
		// Apply *increment* to the *decrement* count on the new map
		newMap.data[nodeId]++

		// [Step 5]
		// Attempt atomic swap (CAS) on the *decrements* pointer
		if p.decrements.CompareAndSwap(currentMap, newMap) {
			// [Step 5a - Success]
			currentMap.Release() // Release pointer's hold on the old map
			return RetryResult[int64]{Value: p.Value(), Done: true} // Signal success.
		}

		// [Step 5b - Failure]
		p.mapPool.Put(newMap) // Return unused map to the pool
		return RetryResult[int64]{Value: p.Value(), Done: false} // Signal retry needed.
	}) // Retry mechanism handles looping if Done == false
}
```

Here's how the Decrement function works inside its retry loop:

1.  **[Step 1] Load Pointer:** First, we atomically load the current pointer to the **decrements** map (`p.decrements.Load()`).
2.  **[Step 2] Get Temporary Map:** Then, we get a reusable map instance (`newMap`) from our object pool (`p.mapPool.Get()`).
3.  **[Step 3] Copy Data (CoW):** We copy all values from the map pointed to by `currentMap` (the current decrements map) into `newMap`. This is the **Copy** step in our **Copy-on-Write** strategy.
4.  **[Step 4] Apply "Decrement" (by Incrementing N):** We apply the _decrement_ operation by **incrementing** the count associated with the given `nodeId` within the `newMap` (the copy). Remember, the `decrements` map tracks the _total_ number of decrements attributed to each node; increasing this count effectively decreases the counter's overall value (`Value = P - N`).
5.  **[Step 5] Attempt Swap (CAS):** We try the atomic **Compare-and-Swap** (`p.decrements.CompareAndSwap`) on the decrements pointer. This operation checks if `p.decrements` still points to `currentMap` and, if so, updates it to point to `newMap`.
    - **[Step 5a - Success]:** If the CAS succeeds, our `newMap` is now the active decrements map. We call `Release()` on the `currentMap` (the old map) to decrement its reference count, making it eligible for garbage collection eventually. The decrement operation is complete.
    - **[Step 5b - Failure]:** If the CAS fails due to a concurrent update by another thread, we discard our `newMap` by returning it to the pool (`p.mapPool.Put(newMap)`) and signal that the operation needs to be retried.

Before moving on to the other `CRDT` methods let's define our `Retry`:

```go
package crdt

import (
	"math/rand"
	"time"
)

// Retry provides configuration for retrying an operation.
type Retry[T any] struct {
	MaxAttempts int           // Maximum number of times to attempt the operation.
	Delay       time.Duration // Initial delay between attempts.
}

// RetryResult wraps the result of one attempt and indicates if it was successful.
type RetryResult[T any] struct {
	Value T    // The value computed by the attempt (may be partial or final).
	Done  bool // True if the operation succeeded and no more retries are needed.
}

// Do executes the provided function 'fn' repeatedly until it succeeds (returns Done: true)
// or the maximum number of attempts is reached. It uses exponential backoff with jitter.
func (r *Retry[T]) Do(fn func() RetryResult[T]) T {
	var result RetryResult[T]
	attempts := 0
	// Start with the base delay.
	currentDelay := r.Delay
	// Cap the backoff delay to avoid excessively long waits.
	maxBackoff := 100 * time.Millisecond // Example cap

	for attempts < r.MaxAttempts {
		// Execute the function representing one attempt.
		result = fn()
		// If the attempt succeeded, return the final value immediately.
		if result.Done {
			return result.Value
		}

		// Increment attempt counter.
		attempts++
		// If we've reached the max attempts, break the loop.
		if attempts >= r.MaxAttempts {
			break
		}

		// Calculate next delay using exponential backoff with jitter:
		// 1. Calculate jitter: random duration up to the *current* base delay.
		jitter := time.Duration(rand.Int63n(int64(currentDelay)))
		// 2. Calculate next base delay: double the current delay.
		newBaseDelay := currentDelay * 2
		// 3. Cap the base delay if it exceeds the maximum backoff.
		if newBaseDelay > maxBackoff {
			newBaseDelay = maxBackoff
		}
		// 4. Set the actual delay for the next sleep: next base delay + jitter.
		// Update currentDelay for the *next* iteration's jitter calculation.
		currentDelay = newBaseDelay
		sleepDuration := currentDelay + jitter

		// Wait before the next attempt.
		time.Sleep(sleepDuration)
	}

	// If the loop finished due to max attempts reached, return the value
	// from the *last* attempt, even though it wasn't successful (Done == false).
	// NOTE: This means the operation ultimately failed.
	return result.Value
}
```

This `Retry` helper function manages repeated attempts for operations, like our CAS, which can fail due to concurrent access.

Instead of a simple busy-loop that could waste CPU, it uses **exponential backoff with jitter**. This means it waits progressively longer between failed attempts and adds randomness, reducing contention and resource usage.

It limits the total number of retries (`MaxAttempts`). If the operation hasn't succeeded after all attempts, this implementation **drops the update** (e.g., the increment or decrement) for that specific request on this node and returns the last known value.

**The Key Trade-off:** This approach prevents excessive CPU usage under high contention but accepts that some updates might be lost locally. Eventual consistency through CRDT merges will ensure _successful_ updates converge across nodes, but it **will not** recover updates that were dropped here due to retry limits being hit. Whether dropping occasional updates is acceptable depends on the specific needs of the application.

Let's define our `Counters` this will be useful when we merge two counters together:

```go
// Counters returns copies of the increment and decrement counter maps
func (p *PNCounter) Counters() (PNMap, PNMap) {
	increments := p.increments.Load()
	increments.Acquire()
	defer increments.Release()

	decrements := p.decrements.Load()
	decrements.Acquire()
	defer decrements.Release()

	// Create independent copies
	incCopy := make(PNMap, len(increments.data))
	decCopy := make(PNMap, len(decrements.data))

	maps.Copy(incCopy, increments.data)
	maps.Copy(decCopy, decrements.data)

	return incCopy, decCopy
}
```

Here comes the most important methods of our CRDT:

```go
// MergeIncrements merges incoming increment counts (other PNMap) into the local counter.
// It uses the CRDT merge rule (take the max value for each node) with CoW/CAS semantics.
// Returns true if the local state was updated, false otherwise (or if retries failed).
func (p *PNCounter) MergeIncrements(other PNMap) bool {
	retry := &Retry[bool]{ // Retry returns bool indicating if merge happened
		MaxAttempts: maxRetryCount,
		Delay:       1 * time.Millisecond,
	}

	return retry.Do(func() RetryResult[bool] {
		// [Step 1] Load current increments map pointer.
		currentMap := p.increments.Load() // Target increments

		// [Step 2] Check if any update is needed (Optimization).
		updatedNeeded := false
		for nodeID, otherValue := range other {
			currentValue, exists := currentMap.data[nodeID]
			// Update needed if other map has a node we don't, or its value is higher.
			if (!exists && otherValue > 0) || (exists && otherValue > currentValue) {
				updatedNeeded = true
				break
			}
		}

		// If current map already reflects or exceeds the other map's state, no merge needed.
		if !updatedNeeded {
			return RetryResult[bool]{Value: false, Done: true} // Indicate no update occurred.
		}

		// [Step 3] Get a temporary map from the pool.
		newMap := p.mapPool.Get()
		// [Step 4] Copy current data into the new map (CoW).
		maps.Copy(newMap.data, currentMap.data)

		// [Step 5] Merge 'other' map into 'newMap' by taking the max value for each node.
		for nodeID, otherValue := range other {
			currentValue := newMap.data[nodeID] // Check value in newMap
			if otherValue > currentValue {      // Apply CRDT merge rule: take the max.
				newMap.data[nodeID] = otherValue
			}
		}

		// [Step 6] Attempt atomic swap (CAS) on the increments pointer.
		if p.increments.CompareAndSwap(currentMap, newMap) { // Target increments
			// [Step 6a - Success] Merge successful.
			currentMap.Release() // Release pointer's hold on the old map.
			return RetryResult[bool]{Value: true, Done: true} // Indicate update occurred.
		}

		// [Step 6b - Failure] CAS failed due to concurrent update.
		p.mapPool.Put(newMap) // Return unused map to the pool.
		return RetryResult[bool]{Value: false, Done: false} // Signal retry needed.
	}) // Retry mechanism loops if Done == false. Returns last Value on failure (false).
}
```

This function merges incoming increment counts (`other` map) into the local counter's increments map, running inside a retry loop:

1.  **[Step 1] Load Pointer:** Atomically load the pointer to the current local **increments** map (`p.increments.Load()`).
2.  **[Step 2] Check if Merge Needed:** Quickly check if the `other` map contains any counts higher than the `currentMap`. If not, no merge is necessary, and the function exits early (returning `false`).
3.  **[Step 3] Get Temporary Map:** If a merge is needed, get a reusable map (`newMap`) from the pool.
4.  **[Step 4] Copy Data (CoW):** Copy data from `currentMap` into `newMap` (Copy-on-Write).
5.  **[Step 5] Apply Merge Logic:** Iterate through the `other` map. For each entry, update `newMap` only if the incoming count (`otherValue`) is greater than the existing count. This ensures we always store the maximum value seen for each node's **increment** count, following the CRDT merge rule.
6.  **[Step 6] Attempt Swap (CAS):** Try to atomically swap the `p.increments` pointer from `currentMap` to `newMap`.
    - **[Step 6a - Success]:** If CAS succeeds, the merged state (`newMap`) is now live for increments. `Release()` the old map and return `true` (update occurred).
    - **[Step 6b - Failure]:** If CAS fails, return the unused `newMap` to the pool (`p.mapPool.Put`) and signal the retry mechanism to try again.

```go
// MergeDecrements merges incoming decrement counts (other PNMap) into the local counter.
// It uses the CRDT merge rule (take the max value for each node) with CoW/CAS semantics.
// Returns true if the local state was updated, false otherwise (or if retries failed).
func (p *PNCounter) MergeDecrements(other PNMap) bool {
	retry := &Retry[bool]{ // Retry returns bool indicating if merge happened
		MaxAttempts: maxRetryCount,
		Delay:       1 * time.Millisecond,
	}

	return retry.Do(func() RetryResult[bool] {
		// [Step 1] Load current decrements map pointer.
		currentMap := p.decrements.Load() // Target decrements

		// [Step 2] Check if any update is needed (Optimization).
		updatedNeeded := false
		for nodeID, otherValue := range other {
			currentValue, exists := currentMap.data[nodeID]
			// Update needed if other map has a node we don't, or its value is higher.
			if (!exists && otherValue > 0) || (exists && otherValue > currentValue) {
				updatedNeeded = true
				break
			}
		}

		// If current map already reflects or exceeds the other map's state, no merge needed.
		if !updatedNeeded {
			return RetryResult[bool]{Value: false, Done: true} // Indicate no update occurred.
		}

		// [Step 3] Get a temporary map from the pool.
		newMap := p.mapPool.Get()
		// [Step 4] Copy current data into the new map (CoW).
		maps.Copy(newMap.data, currentMap.data)

		// [Step 5] Merge 'other' map into 'newMap' by taking the max value for each node.
		for nodeID, otherValue := range other {
			currentValue := newMap.data[nodeID] // Check value in newMap
			if otherValue > currentValue {      // Apply CRDT merge rule: take the max.
				newMap.data[nodeID] = otherValue
			}
		}

		// [Step 6] Attempt atomic swap (CAS) on the decrements pointer.
		if p.decrements.CompareAndSwap(currentMap, newMap) { // Target decrements
			// [Step 6a - Success] Merge successful.
			currentMap.Release() // Release pointer's hold on the old map.
			return RetryResult[bool]{Value: true, Done: true} // Indicate update occurred.
		}

		// [Step 6b - Failure] CAS failed due to concurrent update.
		p.mapPool.Put(newMap) // Return unused map to the pool.
		return RetryResult[bool]{Value: false, Done: false} // Signal retry needed.
	}) // Retry mechanism loops if Done == false. Returns last Value on failure (false).
}
```

This function merges incoming **decrement** counts (`other` map) into the local counter's decrements map, running inside a retry loop:

1.  **[Step 1] Load Pointer:** Atomically load the pointer to the current local **decrements** map (`p.decrements.Load()`).
2.  **[Step 2] Check if Merge Needed:** Quickly check if the `other` map contains any counts higher than the `currentMap`. If not, no merge is necessary, and the function exits early (returning `false`).
3.  **[Step 3] Get Temporary Map:** If a merge is needed, get a reusable map (`newMap`) from the pool.
4.  **[Step 4] Copy Data (CoW):** Copy data from `currentMap` into `newMap` (Copy-on-Write).
5.  **[Step 5] Apply Merge Logic:** Iterate through the `other` map. For each entry, update `newMap` only if the incoming count (`otherValue`) is greater than the existing count. This ensures we always store the maximum value seen for each node's **decrement** count, following the CRDT merge rule.
6.  **[Step 6] Attempt Swap (CAS):** Try to atomically swap the `p.decrements` pointer from `currentMap` to `newMap`.
    - **[Step 6a - Success]:** If CAS succeeds, the merged state (`newMap`) is now live for decrements. `Release()` the old map and return `true` (update occurred).
    - **[Step 6b - Failure]:** If CAS fails, return the unused `newMap` to the pool (`p.mapPool.Put`) and signal the retry mechanism to try again.

And, finally `Merge`:

```go
// Merge combines the state of the 'other' PNCounter into this one ('p').
// It merges both the increment and decrement counts independently.
// Returns true if the merge resulted in any change to the local state, false otherwise.
func (p *PNCounter) Merge(other *PNCounter) bool {
	// [Step 1] Get the increment and decrement maps from the other counter.
	otherIncrements, otherDecrements := other.Counters()

	// [Step 2] Merge the increment maps using the dedicated merge function.
	incUpdated := p.MergeIncrements(otherIncrements)

	// [Step 3] Merge the decrement maps using the dedicated merge function.
	decUpdated := p.MergeDecrements(otherDecrements)

	// [Step 4] Return true if either merge caused an update, false otherwise.
	return incUpdated || decUpdated
}
```

This top-level `Merge` function combines the state from another counter (`other`) into the current counter (`p`).

1.  **[Step 1] Get Other State:** It first gets the increment and decrement count maps from the `other` counter.
2.  **[Step 2] Merge Increments:** It calls `p.MergeIncrements` to merge the incoming increments, taking the maximum count for each node.
3.  **[Step 3] Merge Decrements:** It then calls `p.MergeDecrements` to do the same for the decrement counts.
4.  **[Step 4] Report Change:** It returns `true` if _either_ the increments _or_ the decrements map was updated locally during the merge. If both maps were already up-to-date, it returns `false`.

Essentially, it ensures the current counter reflects the maximum counts seen across both itself and the `other` counter by delegating to the specific `MergeIncrements` and `MergeDecrements` functions.

The CRDT implementation is finally done. Now, we need to ensure it works as expected, especially under concurrent conditions, by writing a couple of tests.

First, let's verify that concurrent operations within a _single_ counter instance yield the correct result. This test ensures our lock-free CAS/CoW logic handles simultaneous updates correctly.

```go
// /crdt/crdt_test.go
package crdt

import (
	"fmt"
	"maps" // Assuming needed based on previous code
	"sync"
	"testing"
	"time" // Assuming needed based on previous code

	"github.com/stretchr/testify/require"
)

// Assume New calls NewPNCounter()
func New(id string) *PNCounter {
	return NewPNCounter()
}

func TestPNCounter_ConcurrentOperations(t *testing.T) {
	counter := New("shared") // Creates a new PNCounter

	// Number of concurrent operations
	concurrency := 100

	var wg sync.WaitGroup
	wg.Add(concurrency * 2) // For both increments and decrements

	// Concurrent increments applied to 'node-inc'
	for i := 0; i < concurrency; i++ {
		go func(id int) {
			defer wg.Done()
			// Error handling omitted for brevity in test
			_ = counter.Increment("node-inc")
		}(i)
	}

	// Concurrent decrements applied to 'node-dec'
	for i := 0; i < concurrency; i++ {
		go func(id int) {
			defer wg.Done()
			// Error handling omitted for brevity in test
			_ = counter.Decrement("node-dec")
		}(i)
	}

	wg.Wait() // Wait for all goroutines to finish

	// --- Assertions ---
	// Check the final total value: +100 on node-inc, -100 effect from node-dec = 0 total
	require.Equal(t, int64(0), counter.Value(), "Value should be 0 after equal increments and decrements on different nodes")

	// Check the specific count for the incremented node
	incMap, _ := counter.Counters() // Helper to get maps might be needed, or use LocalValue
	require.Equal(t, uint64(concurrency), incMap["node-inc"], "node-inc count should be concurrency")
	// Or using LocalValue if available and correct:
	// require.Equal(t, int64(concurrency), counter.LocalValue("node-inc"), "node-inc should have value equal to concurrency")


	// Check the specific count for the decremented node
	_, decMap := counter.Counters()
	require.Equal(t, uint64(concurrency), decMap["node-dec"], "node-dec count should be concurrency")
	// Or using LocalValue:
	// require.Equal(t, int64(-concurrency), counter.LocalValue("node-dec"), "node-dec should have value equal to -concurrency")
}
```

Now, let's test how concurrent **merges** behave when combining state from multiple different counters into one. This ensures the CRDT merge logic (taking the maximum value for each node ID) works correctly even when multiple merges happen simultaneously.

```go
func TestPNCounter_ConcurrentMerges(t *testing.T) {
	main := New("main") // The counter to merge into

	// Create several source counters with different operations
	sources := make([]*PNCounter, 10)
	for i := 0; i < 10; i++ {
		sources[i] = New(fmt.Sprintf("source-%d", i))
		nodeID := fmt.Sprintf("node-%d", i) // Unique ID for increments per source

		// Apply i+1 increments for nodeID
		for j := 0; j < i+1; j++ {
			_ = sources[i].Increment(nodeID)
		}

		// Apply i/2 decrements for a different nodeID if i is even
		if i%2 == 0 {
			decNodeID := fmt.Sprintf("dec-node-%d", i)
			for j := 0; j < i/2; j++ {
				_ = sources[i].Decrement(decNodeID)
			}
		}
	}

	// Create an edge case counter with large values
	edgeCase := New("edge-case")
	largeIncMap := make(PNMap)
	largeIncMap["large-inc"] = uint64(1 << 32)
	_ = edgeCase.MergeIncrements(largeIncMap) // Assume Merge returns bool

	largeDecMap := make(PNMap)
	largeDecMap["large-dec"] = uint64(1 << 31)
	_ = edgeCase.MergeDecrements(largeDecMap) // Assume Merge returns bool

	sources = append(sources, edgeCase) // Add edge case to the list

	// Merge all sources into 'main' concurrently
	var wg sync.WaitGroup
	wg.Add(len(sources))
	for _, src := range sources {
		go func(source *PNCounter) {
			defer wg.Done()
			// Try multiple merges per source to increase contention chances
			for i := 0; i < 3; i++ {
				main.Merge(source)
			}
		}(src)
	}
	wg.Wait() // Wait for all merges to complete

	// --- Calculate Expected Value ---
	expectedInc := uint64(0)
	for i := 0; i < 10; i++ {
		expectedInc += uint64(i + 1) // Sum increments from sources[0] to sources[9]
	}
	expectedInc += uint64(1 << 32) // Add large increment from edge case

	expectedDec := uint64(0)
	for i := 0; i < 10; i += 2 { // Only even sources have decrements
		expectedDec += uint64(i / 2) // Sum decrements from even sources
	}
	expectedDec += uint64(1 << 31) // Add large decrement from edge case

	expectedValue := int64(expectedInc) - int64(expectedDec)

	// --- Assertion ---
	require.Equal(t, expectedValue, main.Value(),
		"Value should reflect all increments and decrements after concurrent merges")

	// Optional: Add checks for specific node values in 'main' if needed
	mainIncMap, mainDecMap := main.Counters()
	require.Equal(t, uint64(10), mainIncMap["node-9"], "Check node-9 increment count") // Example check
    require.Equal(t, uint64(1<<32), mainIncMap["large-inc"], "Check large-inc count") // Example check
    require.Equal(t, uint64(4), mainDecMap["dec-node-8"], "Check dec-node-8 count") // Example check
}
```

There are more detailed tests available in the [companion repository](https://github.com/ogzhanolguncu/distributed-counter/blob/master/part0/crdt/crdt_test.go) (covering aspects like merge idempotency, commutativity, specific edge cases, etc.), but for brevity, only these key concurrency tests are included here.

---

## Conclusion

We've explored key concepts like Gossip Protocol and CRDTs, particularly focusing on implementing a PN-Counter in Go. We've seen how techniques like Copy-on-Write, Compare-and-Swap operations, object pooling, and reference counting enable us to create a thread-safe, lock-free implementation that can handle concurrent operations efficiently.

Through our implementation, we've addressed some of the fundamental challenges in distributed systems, including:

- How to represent state that can be safely merged across nodes
- How to ensure eventual consistency without locking
- How to handle concurrent operations efficiently

The PN-Counter we've built forms the core component that will enable our distributed counter to maintain consistent state across multiple nodes, even in the face of network partitions and concurrent updates. In the upcoming parts of this series, we'll build on this foundation to create a complete distributed system with networking, peer discovery, persistence, and an API gateway.

Remember that the principles we've explored here apply to many other distributed systems beyond our counter example. The techniques of CRDTs, gossip protocols, and lock-free programming are powerful tools in your distributed systems toolbox.

---

## References

1.  [Apache Cassandra Documentation](https://cassandra.apache.org/doc/latest/cassandra/operating/gossip.html). _Details on its use of the Gossip Protocol._
2.  [HashiCorp Consul Documentation](https://developer.hashicorp.com/consul/docs/architecture/gossip). _Details on its use of the Gossip Protocol._
3.  [The Gossip Protocol Explained](https://highscalability.com/gossip-protocol-explained/) - A great introduction to gossip protocols and their applications.
4.  [CAP Theorem](https://en.wikipedia.org/wiki/CAP_theorem) - More information about the tradeoffs in distributed systems.
5.  [CRDT](https://pages.lip6.fr/Marc.Shapiro/papers/RR-7687.pdf) - Paper that explains mathematical properties that make CRDTs work reliably

_If you found this post helpful, feel free to share it and check back for the next part in this series. You can also find the complete code for this implementation on [GitHub](https://github.com/ogzhanolguncu/distributed-counter)._
