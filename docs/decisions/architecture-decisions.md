# Architecture Decision Records (ADRs)

This document captures the important architectural decisions made in the SnapBid repository.

## ADR: Monorepo Strategy

**Context**: The project requires a backend API, a worker process, and shared validation logic.

**Decision**: Use Turborepo and pnpm workspaces.

**Reasoning**: Allows code sharing (Zod schemas, Prisma client) across different Node.js processes without publishing internal packages to npm. Turborepo provides fast, cached builds for TypeScript compilation.

## ADR: Node.js + TypeScript

**Context**: Language selection for the backend.

**Decision**: Node.js with strict TypeScript.

**Reasoning**: Node.js handles I/O heavy workloads (like WebSockets) exceptionally well due to its event-driven non-blocking nature. TypeScript ensures type safety across the monorepo boundaries (from DB schema to shared Zod schemas to API controllers).

## ADR: Relational Storage (PostgreSQL)

**Context**: Storing auctions, users, and bids.

**Decision**: Use PostgreSQL.

**Reasoning**: Bidding requires strict ACID compliance and row-level locking to prevent race conditions. A relational database with transaction support is mandatory. Document databases (like MongoDB) do not provide the necessary isolated row-locking mechanisms required for financial bidding integrity.

## ADR: Prisma ORM

**Context**: Interacting with PostgreSQL.

**Decision**: Use Prisma.

**Reasoning**: Provides excellent developer experience, automatic TypeScript type generation based on the schema, and a clean migration system. It successfully supports the raw SQL execution required for our `SELECT ... FOR UPDATE` concurrency locks.

## ADR: Redis + BullMQ for Background Jobs

**Context**: Auctions need to start and end at specific times in the future.

**Decision**: Use Redis with BullMQ.

**Reasoning**: `setTimeout` or `setInterval` in Node.js are not persistent across server restarts and do not scale. BullMQ provides a persistent, Redis-backed queue with delayed job execution capabilities, ensuring auction transitions occur reliably even if the API server crashes.

## ADR: Separate Worker Process

**Context**: Where should BullMQ jobs run?

**Decision**: Create a dedicated `apps/worker` application.

**Reasoning**: Processing jobs (like finalizing a winner) can block the event loop. By separating the worker from `apps/server`, the API and WebSocket server remain highly responsive to incoming HTTP requests and socket events.

## ADR: Socket.IO for Realtime Notifications

**Context**: Clients need to see new bids instantly.

**Decision**: Use Socket.IO instead of pure WebSockets or Server-Sent Events.

**Reasoning**: Socket.IO provides built-in "Rooms" (e.g., `auction:<id>`), making it trivial to broadcast an event only to users viewing a specific auction. It also provides automatic reconnection logic for unstable mobile networks.

## ADR: Redis Pub/Sub for Cross-Process Communication

**Context**: The Worker process changes an auction to `LIVE`, but the Socket.IO server is in a different process. How does the server know to emit an event?

**Decision**: Use native Redis Pub/Sub.

**Reasoning**: The Worker publishes an event to a Redis channel. The Server subscribes to that channel and emits the Socket.IO event. This cleanly decouples the Worker from needing to know anything about WebSockets.

## ADR: REST for Commands + Socket.IO for Notifications

**Context**: Should clients place bids by emitting a Socket.IO event?

**Decision**: No. Bids are placed via `POST /api/bids`. Socket.IO is only used to broadcast the result.

**Reasoning**:

1. HTTP provides standard status codes (400, 401, 409, etc.) making client-side error handling predictable.
2. Express middleware handles authentication and body validation natively.
3. If a socket connection drops momentarily, a user can still place a bid via HTTP, ensuring the highest reliability for critical write operations.

## ADR: No Socket.IO Redis Adapter Yet

**Context**: Synchronizing socket rooms across multiple servers.

**Decision**: Do not implement `@socket.io/redis-adapter` at this time.

**Reasoning**: The current deployment targets a single `apps/server` instance. The adapter is only necessary when horizontally scaling the Socket.IO server to multiple nodes. Implementing it now adds unnecessary overhead. It remains a future scaling consideration.
