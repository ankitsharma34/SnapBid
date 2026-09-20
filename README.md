# SnapBid

## Overview

SnapBid is a real-time auction platform designed to handle live bidding with strict concurrency controls and real-time notifications. The system provides a seamless experience for sellers to schedule auctions and for buyers to place concurrent bids with instant feedback.

## Key Features

- **User Authentication**: Secure registration and login using Argon2 password hashing and JWT (access/refresh tokens).
- **Auction Lifecycle Management**: Schedule auctions, transition states automatically (DRAFT → SCHEDULED → LIVE → ENDED).
- **Real-time Bidding**: Concurrent bid processing using PostgreSQL transaction isolation and row-level locking (`SELECT ... FOR UPDATE`).
- **Real-time Notifications**: Socket.IO integrated with Redis Pub/Sub to instantly notify users in an auction room about new bids, start, and end events.
- **Background Processing**: Reliable job scheduling for auction state transitions using BullMQ and a dedicated worker process.

## Tech Stack

- **Backend**: Node.js, TypeScript, Express
- **Database**: PostgreSQL (Prisma ORM)
- **Real-time**: Socket.IO, Redis Pub/Sub
- **Queue**: BullMQ, Redis
- **Monorepo**: Turborepo, pnpm
- **Validation**: Zod
- **Logging**: Pino

## System Architecture

The application runs as a multi-process architecture:

- **Server (`apps/server`)**: Handles HTTP REST API requests and Socket.IO client connections.
- **Worker (`apps/worker`)**: Executes background tasks (BullMQ) to transition auction lifecycles.
- **PostgreSQL**: The single source of truth for all transactional data.
- **Redis**: Serves dual purposes—job queue state for BullMQ and Pub/Sub message broker for cross-process communication.

## Repository Structure

```text
apps/
├── server/       # Express REST API + Socket.IO server
├── worker/       # BullMQ worker for auction lifecycle
└── web/          # Frontend (Future/Not Yet Implemented)

packages/
├── auction/      # Core auction domain logic & lifecycle services
├── database/     # Prisma schema, migrations, and generated client
└── shared/       # Shared Zod schemas and validation logic
```

## Core Auction Flow

1. User authenticates and schedules an auction.
2. Background worker schedules `START_AUCTION` and `END_AUCTION` jobs in BullMQ.
3. Users join the real-time Socket.IO `auction:<id>` room.
4. When `START_AUCTION` executes, the auction becomes `LIVE`, and clients receive an `auction:started` event.
5. Users submit bids via the REST API (`POST /bids`).
6. Bids are validated concurrently using database row locks.
7. Upon successful bid, a Redis Pub/Sub message triggers an `auction:bid` Socket.IO event to all users in the room.
8. When `END_AUCTION` executes, the winner is determined, and clients receive an `auction:ended` event.

## Realtime Architecture

SnapBid uses a clear separation of concerns:

- **Commands (Writes)**: Bids are placed via standard HTTP REST endpoints to ensure robust transaction handling and consistent error responses.
- **Notifications (Reads)**: Real-time updates (new bids, status changes) are broadcasted to connected clients via Socket.IO.

## Local Development

_(Refer to package.json for standard scripts)_

```bash
# Install dependencies
pnpm install

# Start development servers
pnpm run dev

# Build the project
pnpm run build
```

## Documentation

For detailed architecture documents, refer to the `docs/` directory:

- [System Architecture](docs/architecture.md)
- [System Overview](docs/system-overview.md)
- [Backend Architecture](docs/backend-architecture.md)
- [Realtime Architecture](docs/realtime-architecture.md)
- [Concurrency Design](docs/concurrency.md)
- [Architecture Decisions (ADRs)](docs/decisions/architecture-decisions.md)

## Project Status

> **Status:** Implemented (Backend Core, Realtime Bidding, Workers)

> **Status:** Planned / Not Yet Implemented (Frontend Web Application)
