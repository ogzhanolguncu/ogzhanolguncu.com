---
pubDatetime: 2025-04-07
title: "Implementing Distributed Counter: Part 0 - CRDT"
slug: implementing-distributed-counter-part-0
tags:
  - go
  - distributed
  - network_programming
description: "Learn how to build a distributed counter from scratch using Go and CRDT (Conflict-free Replicated Data Types)."
---

This is the first in a series of posts about implementing a distributed counter in Go.

- [Part 0: CRDT - Implementing a PNCounter](https://ogzhanolguncu.com/blog/implementing-distributed-counter-part-0/) **(You are here)**
- [Part 1: Node - Structure and In-Memory Communication](https://ogzhanolguncu.com/blog/implementing-distributed-counter-part-1/)
- [Part 2: Networking - Peer Management and TCP Transport](https://ogzhanolguncu.com/blog/implementing-distributed-counter-part-2/)
- _Part 3: Finding Peers - The Discovery Service (Not yet published)_
- _Part 4: Adding Persistence - The Write-Ahead Log (WAL) (Not yet published)_
- _Part 5: Finishing Touches - API Gateway (Not yet published)_

In this series of posts, we are going to build a "Distributed Counter" from scratch using Gossip Protocol. Before going forward, let's discuss the motivation for this series.

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

Imagine nodes in a network are people in a closed room. When one person gets information (an "infection"), they don't shout it to everyone. Instead, they randomly tell (gossip to) a few nearby people. Those people then randomly tell a few others. Like an infection spreading, this random P2P sharing eventually ensures everyone in the room (the network) gets the information. This leads to **eventual consistency**. Systems like Cassandra [<a href="#ref1">1</a>], Consul [<a href="#ref2">2</a>] use Gossip protocol [<a href="#ref3">3</a>] for maintaining cluster membership and exchanging state information between nodes.

```sh

* = Informed Node, O = Uninformed Node

Time 1: Start       Time 2: Spreading   Time 3: Eventual Consistency
+-------+           +-------+           +-------+
| O O O |           | O * O |           | * * * |
| O * O | --------> | * * * | --------> | * * * |
| O O O |           | O * O |           | * * * |
+-------+           +-------+           +-------+
```

This shows how information (`*`) starts at one node and gradually spreads through random interactions until all nodes are informed.

Understanding how Gossip propagates state eventually is key. But **eventually** implies trade-offs. Let's analyze these trade-offs using the CAP theorem to see what guarantees our counter system will provide.

## Understanding CAP in Our Distributed Counter

In our distributed counter we'll mainly focus on **AP** (Availability and Partition tolerance) parts of CAP[<a href="#ref4">4</a>]. Why not strong Consistency you may ask? In the CAP theorem, consistency specifically refers to linearizability (sometimes called strong consistency), which is about all nodes seeing the same data at the same time. We don't need this strong consistency for our counter; we need _eventual_ consistency. Our primary concern is ensuring that all nodes (counters) in our cluster (a bunch of counters) converge to the same final value, regardless of the order in which operations occur.

Since the precise operation order isn't critical for a counter - does it really matter if increments and decrements happen in the sequence **4-3-2-1-6**? No. What matters is that all nodes eventually reach the same consistent state.

So, how do we ensure our counter value converges correctly across all nodes even with network partitions and concurrent updates? This is where Conflict-free Replicated Data Types [CRDTs](<a href="#ref5">5</a>) come in...

---

### Lesson Learned: Why Simple Versioning Isn't Enough (Why CRDTs?)

> I initially attempted to build the distributed counter by just replicating the `counter` value along with a basic incrementing `version` number for conflict resolution.
>
> The naive idea was:
>
> 1. Each node holds a `(value, version)` pair.
> 2. When a node increments, it increases both its local `value` and its `version`.
> 3. Nodes exchange these pairs.
> 4. If Node A receives `(v, ver)` from Node B, and `ver` is greater than Node A's current version, Node A adopts Node B's `value` and `version`.
>
> Not gonna lie that seemed okay for simple cases or strictly sequential updates. Then, I quickly discovered this approach fundamentally breaks down under concurrent operations across multiple nodes.
>
> **Consider this scenario:**
>
> - We have Node A and Node B, both starting at `(value: 0, version: 0)`.
> - **Concurrently**, a client sends 100 increment requests to Node A, and another client sends 100 increment requests to Node B.
> - Node A diligently processes its requests, ending up in state `(value: 100, version: 100)`.
> - Node B _also_ diligently processes its requests, _also_ ending up in state `(value: 100, version: 100)`.
> - Now, Node A and Node B exchange their states via gossip.
> - Node A receives `(100, 100)` from B. Since B's version (100) is not greater than A's version (100), A keeps its state.
> - Node B receives `(100, 100)` from A. Since A's version (100) is not greater than B's version (100), B keeps its state.
>
> Both nodes converge to a final value of 100. But the _actual_ number of increment operations across the system was 200! We completely lost half the operations.
>
> This simple versioning only tells us _which node saw the latest update_ according to its local version counter. It **fails to capture and combine the effects of concurrent operations** that happened independently on different nodes based on the _same_ earlier state. There's no mechanism here to _merge_ the distinct sets of increments performed by A and B; the nodes just overwrite based on a version number that doesn't reflect the combined history.
>
> This realization directly motivated the use of CRDTs, like the PN-Counter, which mathematically guarantee convergence to the correct state by defining how to merge concurrent updates properly.

---

## CRDT

### What's a CRDT?

Okay, imagine you and your friend are coloring in the _exact same_ picture, but you're in different rooms. You both have a copy of the blank picture.

1. **You color the sun yellow.** Your picture now has a yellow sun.
2. **At the same time, your friend colors the tree green.** Their picture now has a green tree.
3. **Later, you magically swap copies of your pictures.**

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

1. Node A sends its value (1) to Node C. Node C updates to 1.
2. Node B sends its value (1) to Node C. Node C sees the value is already 1, so it stays at 1.
3. Node A sends its value (1) to Node B. Node B sees its own value is also 1. It might assume no change is needed or simply overwrite its state with the received state (still 1).
4. Node B sends its value (1) to Node A. Similarly, Node A sees the value matches its own and remains at 1.

**The Incorrect Result:** All nodes converge to a counter value of 1. But this is wrong! Two distinct increment operations occurred (+1 on A, +1 on B). The correct total should be 0 + 1 + 1 = **2**.

**The Problem:** The naive approach of only sharing the _current state_ (the final value on each node) caused us to lose an update. The system didn't preserve the history or the individual _operations_ that led to the state. It just overwrote values with the latest one received. Even simple versioning schemes often fail here, as both Node A and Node B might have performed valid, concurrent updates based on the same initial state (version 0).

**The Solution:** This scenario perfectly illustrates why we need a more sophisticated method. CRDTs are designed precisely for this situation. They define data structures and merge functions that guarantee convergence to a correct state, even when updates happen concurrently and are applied in different orders across replicas, ensuring that no operations are lost.

### PN-Counters

There are different versions of CRDTs, like G-Counter (Grow-Only), PN-Counter (Positive-Negative), and G-Set (Grow-only Set), each serving different purposes. In our implementation, we'll use the PN-Counter. It uses two internal counters: one for increments (P) and one for decrements (N).

The key idea is that each node tracks the P (Positive) and N (Negative) counts originating from every node (including itself) that it knows about. When nodes sync their states, the merge operation combines their knowledge by taking the maximum value seen for each specific node's P count and each specific node's N count.

After merging, the current value of the counter is calculated by summing up all the known P counts from all nodes and subtracting the sum of all the known N counts from all nodes. This process ensures all contributions are counted exactly once, leading to the correct final value even with concurrent updates.

## Why Go?

We'll be implementing this distributed counter in Go, which is well-suited for building networked systems due to its excellent concurrency support.

Its standard library also provides robust networking packages that we'll use throughout this series.
Even if you're not familiar with Go, the concepts we'll explore apply broadly to distributed systems development in any language.

## Part 0 Goal

Having introduced the key concepts like Gossip and CRDTs, our main goal now for Part 0 is to **implement the PN-Counter in Go**. This counter forms the foundation we'll build upon throughout the series.

---

Okay, with the concepts in mind, let's dive into the first piece of code.

## PN-Counter Implementation in Go

Let's setup our directory structure first.

```sh
 crdt/
 ├─ crdt.go
 ├─ crdt_test.go
```

### Core Data Structures

Here's the core structure of our PNCounter. We use two separate `RWMutexes` to potentially allow concurrent increments and decrements if they happen simultaneously.

```go
// crdt/crdt.go
package crdt

import (
 "maps"
 "sync"
)

type (
 // PNMap stores node IDs and their corresponding counts.
 PNMap map[string]uint64

 // PNCounter (Positive-Negative Counter) using separate RWMutexes
 // for increments and decrements to potentially increase concurrency
 // between increment and decrement operations.
 PNCounter struct {
  incMu      sync.RWMutex
  decMu      sync.RWMutex
  increments PNMap
  decrements PNMap
 }
)
```

---

### Lesson Learned: Why These Simple Locks?

> Okay, so you see those plain `sync.RWMutex` fields right there? Let me confess. When I first started this CRDT part, seeing simple mutexes like this felt... well, boring. Like many engineers, I got tempted by the shiny, complex stuff.
>
> So, I went down a rabbit hole. I mean, _really_ went for it: Copy-on-Write, atomic pointers doing Compare-and-Swap, reference counting, object pooling... the works. (You can dig through the `part0` commit history if you enjoy seeing someone willingly inflict pain upon themselves). I basically spent a bunch of time making things way more complicated than they needed to be, chasing some theoretical performance dragon.
>
> And, what happened? After building this intricate beast and running benchmarks... the plain, "boring" `RWMutex` version was **faster**. Yep. All that extra complexity, all those hoops I jumped through? Turned out to be pretty much pointless _for this specific problem_. My guess is juggling whole maps with atomics and all that jazz just adds too much overhead compared to a simple lock.
>
> Why bore you with my war story? Because it's a classic trap! **Don't build complicated shit just because it sounds cool or you think you _should_.** Test the simple way first. It might just save you a ton of time and headache, and sometimes, it's even faster.

---

Right, so that's the "why" behind sticking with the trusty `RWMutex`. Now, let's see how we actually put this `PNCounter` struct and its locks to work, starting with the constructor and read operations.

### Constructor and Read Operations

Now we can define the constructor and the read operations for `PNCounter`.

```go
// New creates a new PNCounter with the provided node ID,
// initializing separate maps and mutexes.
func New(nodeId string) *PNCounter {
 // Initialize maps directly
 incMap := make(PNMap)
 incMap[nodeId] = 0

 decMap := make(PNMap)
 decMap[nodeId] = 0

 return &PNCounter{
  increments: incMap,
  decrements: decMap,
 }
}

// Value returns the current value of the counter (increments - decrements).
// It acquires read locks on both increment and decrement maps.
func (p *PNCounter) Value() int64 {
 // Acquire locks in a consistent order (inc then dec)
 p.incMu.RLock()
 defer p.incMu.RUnlock() // Ensure inc unlock happens

 p.decMu.RLock()
 defer p.decMu.RUnlock() // Ensure dec unlock happens

 var incSum, decSum uint64
 for _, v := range p.increments {
  incSum += v
 }
 for _, v := range p.decrements {
  decSum += v
 }

 return int64(incSum) - int64(decSum)
}

// LocalValue returns the net value for a specific node.
// It acquires read locks on both increment and decrement maps.
func (p *PNCounter) LocalValue(nodeId string) int64 {
 // Acquire locks in a consistent order
 p.incMu.RLock()
 defer p.incMu.RUnlock()

 p.decMu.RLock()
 defer p.decMu.RUnlock()

 var incVal, decVal uint64
 // Direct access within the locks
 if val, ok := p.increments[nodeId]; ok {
  incVal = val
 }
 if val, ok := p.decrements[nodeId]; ok {
  decVal = val
 }

 return int64(incVal) - int64(decVal)
}
```

### Implementing Increment and Decrement

Now, let's implement `Increment` and `Decrement`.

```go
// Increment increments the counter for the specified node.
// It acquires a write lock only on the increments map.
func (p *PNCounter) Increment(nodeId string) {
 p.incMu.Lock() // Acquire increments write lock
 defer p.incMu.Unlock()

 // Direct modification within the lock
 if _, exists := p.increments[nodeId]; !exists {
  p.increments[nodeId] = 0 // Initialize if node is new
 }
 p.increments[nodeId]++
}

// Decrement increments the decrement counter for the specified node.
// It acquires a write lock only on the decrements map.
func (p *PNCounter) Decrement(nodeId string) {
 p.decMu.Lock() // Acquire decrements write lock
 defer p.decMu.Unlock()

 // Direct modification within the lock
 if _, exists := p.decrements[nodeId]; !exists {
  p.decrements[nodeId] = 0 // Initialize if node is new
 }
 p.decrements[nodeId]++ // PNCounter increments the *decrement* map
}
```

The `Increment` method acquires `(incMu.Lock())` to safely update the `increments` map for the given `nodeId`, initializing it if necessary before incrementing. `Decrement` follows the identical pattern for the `decrements` map using `decMu`.

Crucially, using separate `RWMutexes` for increments and decrements allows these operations to potentially run concurrently without blocking each other, as they lock distinct resources. Operations requiring access to both maps, like `Value()`, will naturally need to acquire both corresponding read locks.

### Helper for Merging: Counters

This method safely retrieves copies of the internal maps, useful when sending state to another node or preparing for a merge.

```go
// Counters returns copies of the increment and decrement counter maps.
// It acquires read locks on both maps.
func (p *PNCounter) Counters() (PNMap, PNMap) {
 // Acquire locks in a consistent order
 p.incMu.RLock()
 defer p.incMu.RUnlock()

 p.decMu.RLock()
 defer p.decMu.RUnlock()

 // Create independent copies while holding the locks
 incCopy := make(PNMap, len(p.increments))
 decCopy := make(PNMap, len(p.decrements))

 maps.Copy(incCopy, p.increments)
 maps.Copy(decCopy, p.decrements)

 return incCopy, decCopy
}
```

### Merging Counter State (CRDT Merge Operation)

Here comes the most important method of our CRDT: `Merge`. It combines the state from another counter into the local one according to the PN-Counter rules.
For PN-Counters, merging involves taking the **maximum** count observed for each node ID across both the local and incoming maps, independently for increments and decrements.

```sh
    Merge Logic Example (Taking Max):

    Local Map (Current State)     Incoming Map (Other State)  Resulting Merged Map
    +---------+                   +---------+                 +----------------------+
    | NodeA: 5|                   | NodeA: 4|                 | NodeA: max(5, 4) = 5 |
    | NodeB: 2| <-- Merge Rule -->| NodeB: 6| --------------> | NodeB: max(2, 6) = 6 |
    | NodeC: 7|                   | NodeC: 7|                 | NodeC: max(7, 7) = 7 |
    +---------+                   +---------+                 +----------------------+
```

Let's implement `MergeIncrements` and `MergeDecrements`.

```go
// MergeIncrements merges external increment values with the local counter.
// It acquires a write lock only on the increments map.
func (p *PNCounter) MergeIncrements(other PNMap) bool {
 p.incMu.Lock() // Acquire increments write lock
 defer p.incMu.Unlock()

 updated := false
 for nodeID, otherValue := range other {
  currentValue, exists := p.increments[nodeID]
  // Merge condition: take the max value
  if (!exists && otherValue > 0) || otherValue > currentValue {
   p.increments[nodeID] = otherValue
   updated = true
  }
 }
 return updated
}

// MergeDecrements merges external decrement values with the local counter.
// It acquires a write lock only on the decrements map.
func (p *PNCounter) MergeDecrements(other PNMap) bool {
 p.decMu.Lock() // Acquire decrements write lock
 defer p.decMu.Unlock()

 updated := false
 for nodeID, otherValue := range other {
  currentValue, exists := p.decrements[nodeID]
  // Merge condition: take the max value
  if (!exists && otherValue > 0) || otherValue > currentValue {
   p.decrements[nodeID] = otherValue
   updated = true
  }
 }
 return updated
}

// Merge combines this counter with another counter's state.
// It acquires write locks on the local counter via MergeIncrements/MergeDecrements
// and read locks on the other counter via its Counters() method.
func (p *PNCounter) Merge(other *PNCounter) bool {
 // Get copies of the other counter's state (acquires RLock on 'other' maps)
 otherIncrements, otherDecrements := other.Counters()

 // Merge into the local counter (acquires Lock on 'p' maps respectively)
 incUpdated := p.MergeIncrements(otherIncrements)
 decUpdated := p.MergeDecrements(otherDecrements)

 return incUpdated || decUpdated
}
```

The `MergeIncrements` and `MergeDecrements` methods implement this: each acquires the appropriate local write lock (`incMu` or `decMu`) and updates the local map entries by taking the max compared to the corresponding entries in the `other` map.

The main `Merge` function orchestrates this efficiently:

1. It first obtains a consistent snapshot of the `other` counter's state by calling `other.Counters()` (which uses read locks on the `other` counter).
2. It then calls the local `MergeIncrements` and `MergeDecrements` methods, passing in the copied state. These methods handle acquiring the necessary _write_ locks on the _local_ counter (`p`) to safely integrate the received state.

The CRDT implementation is finally done. Now, we need to ensure it works as expected, especially under concurrent conditions, by writing a couple of tests.

### Testing Concurrent Operations

First, let's verify that concurrent operations within a _single_ counter instance yield the correct result. This test ensures our logic handles simultaneous updates correctly.

```go
// /crdt/crdt_test.go
func TestPNCounter_ConcurrentOperations(t *testing.T) {
 counter := New("shared")

 // Number of concurrent operations
 concurrency := 100

 var wg sync.WaitGroup
 wg.Add(concurrency * 2) // For both increments and decrements

 // Concurrent increments applied to 'node-inc'
 for i := 0; i < concurrency; i++ {
  go func(id int) {
   defer wg.Done()
   counter.Increment("node-inc")
  }(i)
 }

 // Concurrent decrements applied to 'node-dec'
 for i := 0; i < concurrency; i++ {
  go func(id int) {
   defer wg.Done()
   counter.Decrement("node-dec")
  }(i)
 }

 wg.Wait() // Wait for all goroutines to finish

 // Check the final total value: +100 on node-inc, -100 effect from node-dec = 0 total
 require.Equal(t, int64(0), counter.Value(), "Value should be 0 after equal increments and decrements on different nodes")

 // Check the specific count for the incremented node
 incMap, _ := counter.Counters() // Helper to get maps
 require.Equal(t, uint64(concurrency), incMap["node-inc"], "node-inc count should be concurrency")

 // Check the specific count for the decremented node
 _, decMap := counter.Counters()
 require.Equal(t, uint64(concurrency), decMap["node-dec"], "node-dec count should be concurrency")

 // Check LocalValue too
 require.Equal(t, int64(concurrency), counter.LocalValue("node-inc"), "node-inc local value check")
 require.Equal(t, int64(-concurrency), counter.LocalValue("node-dec"), "node-dec local value check")
}
```

### Testing Concurrent Merges

Now, let's test how concurrent **merges** behave when combining state from multiple different counters into one. This ensures the CRDT merge logic (taking the maximum value for each node ID) works correctly even when multiple merges happen simultaneously.

```go
func TestPNCounter_ConcurrentMerges(t *testing.T) {
 main := New("main") // The counter to merge into

 // Create several source counters with different operations
 sources := make([]*PNCounter, 10)
 for i := 0; i < 10; i++ {
  nodeIdSuffix := fmt.Sprintf("%d", i)
  sources[i] = New("source-" + nodeIdSuffix) // Use defined constructor
  nodeID := "node-" + nodeIdSuffix // Unique ID for increments per source

  // Apply i+1 increments for nodeID
  for j := 0; j < i+1; j++ {
    sources[i].Increment(nodeID)
  }

  // Apply i/2 decrements for a different nodeID if i is even
  if i%2 == 0 {
   decNodeID := "dec-node-" + nodeIdSuffix
   for j := 0; j < i/2; j++ {
    sources[i].Decrement(decNodeID)
   }
  }
 }

 // Create an edge case counter with large values
 edgeCase := New("edge-case")
 largeIncMap := make(PNMap)
 largeIncMap["large-inc"] = uint64(1 << 32)
 edgeCase.MergeIncrements(largeIncMap)

 largeDecMap := make(PNMap)
 largeDecMap["large-dec"] = uint64(1 << 31)
 edgeCase.MergeDecrements(largeDecMap)

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

 require.Equal(t, expectedValue, main.Value(),
  "Value should reflect all increments and decrements after concurrent merges")

 mainIncMap, mainDecMap := main.Counters()
 require.Equal(t, uint64(10), mainIncMap["node-9"], "Check node-9 increment count") // Example check
    require.Equal(t, uint64(1<<32), mainIncMap["large-inc"], "Check large-inc count") // Example check
    require.Equal(t, uint64(4), mainDecMap["dec-node-8"], "Check dec-node-8 count") // Example check
    require.Equal(t, uint64(1<<31), mainDecMap["large-dec"], "Check large-dec count") // Example check
}
```

There are more detailed tests available in the [companion repository](https://github.com/ogzhanolguncu/distributed-counter/blob/master/part0/crdt/crdt_test.go) (covering aspects like merge idempotency, commutativity, specific edge cases, etc.), but for brevity, only these key concurrency tests are included here.

---

## Conclusion

We've explored key concepts like Gossip Protocol and CRDTs, particularly focusing on implementing a PN-Counter in Go.
Through our implementation, we've addressed some of the fundamental challenges in distributed systems, including:

- How to represent state that can be safely merged across nodes
- How to ensure eventual consistency without locking
- How to handle concurrent operations efficiently

The PN-Counter we've built forms the core component that will enable our distributed counter to maintain consistent state across multiple nodes, even in the face of network partitions and concurrent updates. In the upcoming parts of this series, we'll build on this foundation to create a complete distributed system with networking, peer discovery, persistence, and an API gateway.

Remember that the principles we've explored here apply to many other distributed systems beyond our counter example.
The techniques of CRDTs, gossip protocols, and safe concurrency patterns are powerful tools in your distributed systems toolbox.

## Final system architecture at end of this series

```go
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
+----------------------+<-- DigestPull/Ack/Push -->+---------------------+
|       Node 1         |     (State Sync)         |       Node 2         |
|----------------------|                          |----------------------|
| PNCounter            |                          | PNCounter            |
|  - Increments: {...} |                          |  - Increments: {...} |
|  - Decrements: {...} |                          |  - Decrements: {...} |
| PeerManager          |                          | PeerManager          |
| TCPTransport         |                          | TCPTransport         |
| WAL                  |                          | WAL                  |
+--------+-------------+                          +--------+-------------+
         ^    |                                             ^    |
         |    | HTTP                                        |    | HTTP
         |    v                                             |    v
+--------+-------------+                          +--------+-------------+
| DiscoveryClient      |                          | DiscoveryClient      |
+----------------------+                          +----------------------+
         |    ^                                             |    ^
         |    | Register                                    |    | Register
         |    | Heartbeat                                   |    | Heartbeat
         |    | GetPeers                                    |    | GetPeers
         v    |                                             v    |
+--------------------------------------------------------------------------+
|                                Discovery Server                          |
|--------------------------------------------------------------------------|
| - knownPeers: {"node1_addr": {LastSeen}, "node2_addr": {LastSeen}}       |
| - Endpoints:                                                             |
|   * POST /register                                                       |
|   * POST /heartbeat                                                      |
|   * GET /peers                                                           |
+--------------------------------------------------------------------------+
```

This will be our final architecture and in each post, we'll work towards that goal.

---

## References

1. <a id="ref1"></a>[Apache Cassandra
   Documentation](https://cassandra.apache.org/doc/latest/cassandra/operating/gossip.html). _Details
   on its use of the Gossip Protocol._
2. <a id="ref2"></a>[HashiCorp Consul
   Documentation](https://developer.hashicorp.com/consul/docs/architecture/gossip). _Details on its
   use of the Gossip Protocol._
3. <a id="ref3"></a>[The Gossip Protocol
   Explained](https://highscalability.com/gossip-protocol-explained/) - A great introduction to
   gossip protocols and their applications.
4. <a id="ref4"></a>[CAP Theorem](https://en.wikipedia.org/wiki/CAP_theorem) - More information
   about the tradeoffs in distributed systems.
5. <a id="ref5"></a>[CRDT](https://pages.lip6.fr/Marc.Shapiro/papers/RR-7687.pdf) - Paper that
   explains mathematical properties that make CRDTs work reliably
6. <a id="ref6"></a>[Compare-and-swap - Wikipedia](https://en.wikipedia.org/wiki/Compare-and-swap).
   _Provides a good overview of the CAS atomic operation._
7. <a id="ref7"></a>[Copy-on-write - Wikipedia](https://en.wikipedia.org/wiki/Copy-on-write).
   _Explains the CoW optimization technique._

_If you found this post helpful, feel free to share it and check back for the next part in this series. You can also find the complete code for this implementation on [GitHub](https://github.com/ogzhanolguncu/distributed-counter/tree/master/part0)._
