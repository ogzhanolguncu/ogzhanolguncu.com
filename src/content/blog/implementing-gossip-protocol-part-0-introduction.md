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

Gossip protocol is actually a pretty old concept dates back to 60's, and it's being used heavily since then by Cassandra, DynamoDB, Ethereum(ETH) and many others. They are all relying on gossip protocol for different reasons
such as failure detection, peer discovery, transaction propagation, data replication and etc... Since it's one of those concepts that powering our world, it's fun and educative to learn from it.

A little history before we delve into the details; original paper that got Gossip protocol famous was [Epidemic Algorithms for Replicated Database
Maintenance](http://bitsavers.informatik.uni-stuttgart.de/pdf/xerox/parc/techReports/CSL-89-1_Epidemic_Algorithms_for_Replicated_Database_Maintenance.pdf). The Xerox had multiple offices and they needed to
maintain replicated data about users, printers, and other network resources.

Imagine trying to keep multiple copies of a database synchronized across different locations when your network connections are unstable. Now imagine doing this in the 1980s, when distributed systems were in their infancy. This was exactly the challenge that led to one of distributed computing's most elegant solutions: the Epidemic algorithm, later referred to as the gossip protocol.

This nature-inspired name derives from how viruses spread in biology. Imagine a closed room, such as a closed network of computers. Now imagine every computer in that room as a human. If you infect one of them and wait long enough, since the room is closed, everyone in that room will **_eventually_** get infected - this is also the reason why this algorithm achieves eventual consistency.

## Why Replicate our State Though?

It's crucial for several reasons. Let's look at this situation with a concrete example. Imagine we are operating a website and storing everything in our database, and one day our database stops for an unknown reason and might take 5 minutes to restart. What should we tell our users?
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

![push-based](/blog-images/implementing-gossip-protocol-part-0/push-based.png)

In a push-based approach, nodes actively send updates to their peers without checking the recipients' current version. A recipient refuses the update if it has a higher version number and accepts it otherwise. This creates network overhead due to redundant pushes, especially when recipient nodes are offline or experiencing network congestion.

The image above shows how Node 2 unnecessarily pushes updates to Node 3 without checking its state first. This inefficiency becomes more significant in large networks - imagine 2,000 nodes pushing updates to each other without state verification.

This doesn't mean push-based approach is bad, it has it's own use cases.

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

![pull-based](/blog-images/implementing-gossip-protocol-part-0/pull-based.png)

In a pull-based approach, nodes request data at their own pace. They can slow down polling when they are busy, which provides natural load balancing and reduces redundant message transmission since nodes don't push updates immediately upon receiving data.

If we are dealing with:

- Long-lived data: Information that remains relevant for extended periods, like configuration settings
- Non-time-critical updates: Updates where immediate propagation isn't crucial, such as background synchronization tasks
- Resource-constrained systems: Environments where nodes need to manage their processing and network bandwidth carefully

The ideal conditions for pull-based gossip are:

- High network latency tolerance: Systems that can handle delayed updates without compromising functionality
- Variable load patterns: Networks where nodes experience fluctuating workloads and need to control their update rates

#### Hybrid Approach

### Failure Handling

### Speed of Gossip
