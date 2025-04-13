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

Before moving on, we have to make a brief detour and talk about something called DbC (Design by Contract). I'm not going to go into its details or history. To summarize it, we'll make assertions to ensure everything is as we expected. It's a great way to make sure your code is behaving as you instructed, and it's really helpful for spotting randomness in your code. More importantly, we have to catch those nasty issues before they cause serious damage.

Let's take a look at it. By the way, here's our directory setup for this part:

Let's set up our directory structure first.

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

Okay, where were we? Right, assertions.

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

> **Note:** To use `msgpack`, you'll need to install it: `go get github.com/vmihailenco/msgpack/v5` and to use `zstd`, `go get"github.com/klauspost/compress/zstd`"
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
