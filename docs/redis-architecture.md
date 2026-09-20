# Redis Architecture

Redis serves two distinct and separate responsibilities in the SnapBid architecture. It is critical to understand that these responsibilities use different Redis concepts and require separate connection strategies.

## 1. Job Queue (BullMQ)

**Responsibility**: Managing delayed and background jobs for the auction lifecycle.

BullMQ uses Redis as its data store. It stores job metadata, queue status, delay timers, and retry logic.

- The **Server** (`apps/server`) acts as a BullMQ _Producer_, pushing jobs into the queue when an auction is created.
- The **Worker** (`apps/worker`) acts as a BullMQ _Consumer_, pulling jobs from the queue when their execution time is reached.

## 2. Cross-Process Messaging (Redis Pub/Sub)

**Responsibility**: Real-time event delivery across processes.

Because the Worker process executes lifecycle changes (e.g., Auction Started, Auction Ended), but the Server process holds the WebSocket connections, the Worker must communicate with the Server.

SnapBid uses native Redis Pub/Sub for this.

- The **Worker** acts as a Publisher. When it changes an auction state, it publishes a JSON payload to a specific Redis channel.
- The **Server** acts as a Subscriber. It listens to the Redis channel. When it receives a message, it parses the JSON and broadcasts the corresponding Socket.IO event.

### Dedicated Pub/Sub Connections

In Redis, once a client connection issues a `SUBSCRIBE` command, it is put into "subscriber mode". In this mode, it cannot issue standard Redis commands (like `GET`, `SET`, or the complex Lua scripts used by BullMQ).

Therefore, the `apps/server` maintains a **dedicated Redis connection** solely for the Pub/Sub subscriber (`redis.pubsub.ts`). This is separate from the standard Redis connection used by BullMQ.

## Clarification: Redis Pub/Sub vs. Socket.IO Redis Adapter

**Do not confuse the current Redis Pub/Sub implementation with the Socket.IO Redis Adapter.**

- **Current Implementation (Redis Pub/Sub)**: An internal application-level messaging bus. The Worker manually publishes strings to a channel, and the Server manually parses those strings and calls `io.to(...).emit(...)`.
- **Socket.IO Redis Adapter**: A library that handles broadcasting Socket.IO packets across multiple Socket.IO servers.

Currently, SnapBid uses a single Socket.IO server, so the Socket.IO Redis Adapter is not required. The native Redis Pub/Sub is used strictly to bridge the gap between the headless Worker process and the Server process.
