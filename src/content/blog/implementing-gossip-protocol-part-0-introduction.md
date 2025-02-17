---
pubDatetime: 2025-02-16
title: "Implementing Gossip Protocol: Part 0 - Introduction"
slug: implementing-gossip-protocol-part-0-introduction
tags:
  - go
  - distributed
  - network_programming
description: Implementing gossip protocol with golang
---

This is the first in a series of posts about implementing gossip protocol in Go:

- Part 0: Introduction (you are here)
- Part 1: Distributed Counter
- Part 2: Node Discovery and Membership
- Part 3: Version Control with Lamport Clocks
- Part 4: Phi Accrual Failure Detection

Gossip protocol is actually a pretty old concept dating back to the 60's, and it's being used heavily since then by Cassandra, DynamoDB, Ethereum(ETH) and many others. They are all relying on gossip protocol for different reasons
such as failure detection, peer discovery, transaction propagation, data replication and etc... Since it's one of those concepts that powering our world, it's fun and educative to learn from it.

A little bit of history before we delve into the details; the original paper that made Gossip protocol famous was [Epidemic Algorithms for Replicated Database
Maintenance](http://bitsavers.informatik.uni-stuttgart.de/pdf/xerox/parc/techReports/CSL-89-1_Epidemic_Algorithms_for_Replicated_Database_Maintenance.pdf). Xerox had multiple offices and they needed to
maintain replicated data about users, printers, and other network resources.

Imagine trying to keep multiple copies of a database synchronized across different locations - continents, Xerox had offices all around the world - when your network connections are unstable. Now consider doing this in the 1980s, when distributed systems were in their infancy. This was exactly the challenge that led to one of distributed computing's most elegant solution: the Epidemic algorithm, later referred to as the gossip protocol.

This nature-inspired name derives from how viruses spread in biology. Imagine a closed room, such as a closed network of computers. Now imagine every computer in that room as a human. If you infect one of them and wait long enough, since the room is closed, everyone in that room will **_eventually_** get infected - this is also the reason why this algorithm achieves eventual consistency.

## Why Replicate our State Though?

It's crucial for several reasons. Let's look at this situation with a concrete example. Suppose we are operating a website and storing everything in our database, and one day our database stops for an unknown reason and might take 5 minutes to restart. What should we tell our users?
All they see is a weird connection timeout issue because our server cannot establish a reliable connection with the database (here, database represents any arbitrary data store). This creates a poor user experience, right?

What else could we do about that? We could save our data into different databases to overcome this issue. Now if we experience an outage, we can failover to other databases.
Then comes consistency: how can we ensure all the databases have the same data? You guessed it right, through replication. As long as some nodes survive the outage, we can easily bring new nodes or nodes that experienced outages back up to speed. Many ways exist to accomplish this, but today we'll see how gossip protocol solves this issue just as Xerox did to solve their replication problem.

## How Does Gossip Protocol Solve This Issue

To understand how gossip protocol works in practice, let's break it down. In its most basic form, each node (or computer) in the network periodically picks a random peer to exchange information with - much like how people randomly choose who to share gossip with.
This simple act of random information exchange, when repeated over time, ensures information propagation across the entire network, even in the face of unreliable connections or temporary node failures.

### Gossip Strategies

Systems implement different strategies when using gossip protocol to spread information across distributed networks.
Some systems prioritize consistency and focus on state conflict resolution and reliability, while others optimize for high throughput and speed.
Each strategy reflects different trade-offs: a social media feed might favor speed over perfect consistency, while a distributed database might prioritize data accuracy over immediate updates.

#### Push Based Approach

In a push-based approach, nodes actively send updates to their peers without checking the recipients' current version. A recipient refuses the update if it has a higher version number and accepts it otherwise. This creates network overhead due to redundant pushes, especially when recipient nodes are offline or experiencing network congestion.

![push-based](/blog-images/implementing-gossip-protocol-part-0/push.png)
This doesn't mean push-based approach is bad, it has its own use cases.

If we are dealing with:

- Short-lived data: Information that quickly becomes outdated, like real-time stock prices or game state updates, where speed matters more than perfect consistency
- Real-time updates: Scenarios requiring immediate data propagation, such as live chat messages or multiplayer game positions, where minimal delay is crucial
- Lightweight updates: Small pieces of information like status changes or simple notifications that don't consume significant bandwidth

The ideal conditions for push-based gossip are:

- Low network latency requirements: Networks where messages can be delivered quickly and reliably, typically within the same data center or region
- High probability of update relevance: Environments where most pushed updates are likely to be newer than the recipient's current state, reducing wasted transmissions
- Small update sizes: Messages that are compact and don't strain network resources, like configuration changes or simple state updates
- Stable network conditions: Networks with minimal packet loss and consistent connectivity, ensuring reliable message delivery
- Tolerance for occasional missed updates: Systems that can function correctly even if some updates aren't received, like social media feeds

#### Pull Based Approach

In a pull-based approach, nodes request data at their own pace. They can slow down polling when they are busy, which provides natural load balancing and reduces redundant message transmission since nodes don't push updates immediately upon receiving data.

![pull-based](/blog-images/implementing-gossip-protocol-part-0/pull.png)

If we are dealing with:

- Long-lived data: Information that remains relevant for extended periods, like configuration settings
- Non-time-critical updates: Updates where immediate propagation isn't crucial, such as background synchronization tasks
- Resource-constrained systems: Environments where nodes need to manage their processing and network bandwidth carefully

The ideal conditions for pull-based gossip are:

- High network latency tolerance: Systems that can handle delayed updates without compromising functionality
- Variable load patterns: Networks where nodes experience fluctuating workloads and need to control their update rates

#### Push-Pull Approach

In a push-pull approach, nodes combine both strategies to optimize information exchange. When two nodes interact, they first exchange version information and then bidirectionally sync data only if necessary, which minimizes network overhead and ensures efficient propagation.

![pull-push-based](/blog-images/implementing-gossip-protocol-part-0/push-pull.png)

If we are dealing with:

- Complex distributed systems: Environments where nodes need to maintain eventual consistency while managing resources efficiently

The ideal conditions for push-pull gossip are:

- Moderate network conditions: Networks with varying latency and reliability characteristics

### Use Cases

Just like there are strategies for many different cases, there are many use cases for gossip protocol. Due to its flexibility and simple implementation, it's been adapted for various purposes. Here are some famous examples:

#### Distributed Databases

- **Cassandra**: Uses gossip for cluster membership and failure detection. Each node periodically exchanges state information about itself and other nodes it knows about, helping maintain an eventually consistent view of the cluster state.
- **DynamoDB**: Employs gossip for maintaining membership information across its storage nodes, enabling efficient request routing and load balancing.

#### Blockchain Networks

- **Ethereum**: Relies on gossip protocols for transaction and block propagation. When a node receives a new transaction or block, it "gossips" this information to its peers, ensuring rapid propagation across the network.

#### Service Discovery

- **Kubernetes**: Uses a gossip-like mechanism in some CNI (Container Network Interface) implementations for service discovery and network overlay management.

#### Load Balancing

- **NGINX Plus**: Implements gossip-based state sharing for dynamic reconfiguration without service interruption.

#### Monitoring and Metrics

- **Prometheus**: Some service discovery mechanisms use gossip-based approaches to maintain an up-to-date view of targets to monitor.

#### Content Distribution

- **IPFS (InterPlanetary File System)**: Uses gossip-like protocols for content routing and discovery in its peer-to-peer network.

The versatility of gossip protocols makes them particularly valuable in scenarios where:

- Systems need to scale horizontally with minimal configuration
- Network conditions are unpredictable or unreliable
- Eventual consistency is acceptable
- Decentralized operation is required
- Real-time state propagation is needed without central coordination

### Speed of Gossip

The speed at which information propagates through a gossip-based system follows an mathematical pattern. Understanding this helps us predict system behavior and make informed design decisions.

#### Exponential Propagation

In a gossip network of n nodes, information typically spreads in an exponential fashion. Here's how it works:

- In round 1: 1 node has the information
- In round 2: 2 nodes have it
- In round 3: 4 nodes have it
- In round 4: 8 nodes have it
  And so on, following a 2^k pattern (where k is the round number)

This exponential growth means that in a network of n nodes, information typically propagates to all nodes in O(log n) rounds. However, this is the idealized case, and real-world factors can affect this rate.

#### Factors Affecting Propagation Speed

- **Network Topology**: The connection pattern between nodes can significantly impact propagation speed. Dense networks typically propagate faster than sparse ones.
- **Message Loss**: Network failures or congestion can cause messages to be lost, slowing down propagation.
- **Node Selection Strategy**: How nodes choose their gossip partners affects spread efficiency:
  - Random selection provides robust but potentially slower propagation
  - Deterministic selection can be faster but less resilient to failures

#### Network Load Considerations

The frequency of gossip rounds presents a trade-off:

- Higher frequency leads to faster propagation but increases network load
- Lower frequency reduces network overhead but slows down information spread
- A typical compromise is to gossip every 1-2 seconds in stable networks

### Why Go
