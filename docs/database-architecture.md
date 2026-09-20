# Database Architecture

## Overview

SnapBid uses PostgreSQL as its primary relational database, managed via the Prisma ORM. The schema is located in `packages/database/prisma/schema.prisma`.

## Key Entities & Relationships

### `User`

- Represents authenticated actors in the system.
- Has relations to auctions they created (`auctions`), bids they placed (`bids`), and auctions they won (`winnerAuctions`).

### `Auction`

- Represents the item being sold.
- **Financial Fields**: `startingPrice`, `currentPrice`, `bidIncrement` are stored as Prisma `Decimal` types. This maps to the PostgreSQL `DECIMAL` / `NUMERIC` type, which is critical for exact precision when dealing with monetary values (avoiding floating-point arithmetic errors).
- **Status Enum**: Tracks lifecycle via `AuctionStatus` (`DRAFT`, `SCHEDULED`, `LIVE`, `ENDED`, `CANCELLED`).
- **Winner Relationship**: An auction can optionally link to a winning `User` (`winnerId`) and a winning `Bid` (`winningBidId`). These are populated when the `END_AUCTION` job finalizes the auction.

### `Bid`

- Represents a single financial commitment.
- Links to the `Auction` and the `User` (`bidderId`).
- `amount` is stored as `Decimal`.

### Other Entities

- `RefreshToken`: Maps to users for JWT session rotation.
- `AuctionImage`: 1-to-Many relationship with Auction for gallery displays.
- `Category`: Many-to-Many grouping for Auctions.

## Important Design Decisions

### Decimal for Monetary Values

All price and bid amount fields use the `Decimal` type. In Node.js, these are instantiated using `Prisma.Decimal` (which wraps `decimal.js`). This ensures that addition (e.g., `currentPrice + bidIncrement`) is mathematically precise.

### The Winning Bid Relationship

When an auction ends, determining the winner could dynamically be queried (`ORDER BY amount DESC LIMIT 1`). However, to optimize read performance for historical auctions and provide an explicit finalized state, the `Auction` model includes explicit one-to-one foreign keys:

- `winnerId`
- `winningBidId`

These are explicitly set by the background worker inside a transaction when the auction closes.

### Indexes

The schema defines composite and targeted indexes to optimize common query patterns:

- `@@index([status, endTime])` on `Auction`: Optimizes queries looking for live auctions that are about to end.
- `@@index([auctionId, amount])` on `Bid`: Optimizes querying the highest bid for a specific auction.
- `@@index([auctionId, createdAt])` on `Bid`: Optimizes loading chronological bid history for the real-time room.
