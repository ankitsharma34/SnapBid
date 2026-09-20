# API Architecture

The SnapBid HTTP server (`apps/server`) exposes REST endpoints organized by domain modules. All request and response bodies are validated using Zod schemas (`@snapbid/shared`).

Below are the primary implemented endpoints driving the core application.

## Auth Module (`/api/auth`)

### `POST /api/auth/register`

- **Auth**: Public
- **Purpose**: Create a new user account.
- **Request Body**: `email`, `username`, `displayName`, `password`
- **Response**: `201 Created` with Access Token. Sets HTTP-only refresh cookie.

### `POST /api/auth/login`

- **Auth**: Public
- **Purpose**: Authenticate an existing user.
- **Request Body**: `email`, `password`
- **Response**: `200 OK` with Access Token. Sets HTTP-only refresh cookie.

## Auctions Module (`/api/auctions`)

### `GET /api/auctions`

- **Auth**: Required (`Bearer`)
- **Purpose**: Get a list of all auctions.
- **Request Body**: None
- **Response**: `200 OK` with an array of auction objects.

### `POST /api/auctions`

- **Auth**: Required (`Bearer`)
- **Purpose**: Creates and schedules a new auction.
- **Request Body**: `title`, `description`, `startingPrice`, `bidIncrement`, `startTime`, `endTime`
- **Response**: `201 Created` with the auction object.
- **Side Effect**: Pushes `START_AUCTION` and `END_AUCTION` delayed jobs to BullMQ.

### `GET /api/auctions/:id`

- **Auth**: Required (Bearer)
- **Purpose**: Fetch details for a specific auction.
- **Response**: `200 OK` with auction data including current status and price.

### `PATCH /api/auctions/:id`

- **Auth**: Required (Bearer)
- **Purpose**: Update the details of an existing auction.
- **Request Body**: `title`, `description`, `startingPrice`, `bidIncrement`, `startTime`, `endTime`
- **Response**: `200 OK` with the updated auction object.

### `PATCH /api/auctions/:id/cancel`

- **Auth**: Required (Bearer)
- **Purpose**: Cancel an existing auction.
- **Request Body**: None
- **Response**: `200 OK` with a confirmation message.

> Note: Deleting auctions is not supported. Canceled auctions are marked as `CANCELED` in the database and cannot be reactivated.`

## Bids Module

### `POST /api/auctions/:auctionId/bids`

- **Auth**: Required (`Bearer`)
- **Purpose**: Place a new bid on a live auction.
- **Request Body**: `auctionId`, `amount`
- **Response**: `201 Created` with the new bid record.
- **Errors**:
  - `400 Bad Request`: Bid increment too low.
  - `403 Forbidden`: Seller attempting to bid.
  - `409 Conflict`: Auction is not LIVE.
- **Side Effect**: Triggers `auction:bid` Redis Pub/Sub event for Socket.IO broadcast.

### `GET /api/auctions/:auctionId/bids`

- **Auth**: Required (Bearer)
- **Purpose**: Retrieve the chronological bid history for a specific auction.
- **Response**: `200 OK` with an array of historical bids (descending by timestamp).

## Health Module (`/api/health`)

### `GET /api/health`

- **Auth**: Public
- **Purpose**: Liveness probe for infrastructure routing.
- **Response**: `200 OK` `{"status": "ok"}` with metadata of the system's current state.
