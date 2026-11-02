# API Architecture

The SnapBid HTTP server (`apps/server`) exposes JSON REST endpoints organized by domain. Request bodies, path parameters, and query parameters are validated with Zod schemas from `@snapbid/shared`.

## Conventions

- Protected endpoints require `Authorization: Bearer <access-token>`.
- Date-time values are serialized as ISO 8601 strings. Monetary response values are strings to preserve decimal precision.
- Successful domain responses generally use `success`, `message`, `data`, and, where applicable, `pagination`.
- The server accepts or generates an `x-request-id` and returns it in errors.

Errors use this stable contract:

```json
{
  "success": false,
  "requestId": "request-id",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [{ "field": "fieldName", "message": "Validation message" }]
  }
}
```

`details` appears only when field-level information is available. Unexpected errors do not expose internal exception messages.

## Service Endpoints

### `GET /`

- **Auth**: Public
- **Purpose**: Confirm that the HTTP server is running.
- **Response**: `200 OK` with `success: true` and a server-running message.

### `GET /health`

- **Auth**: Public
- **Purpose**: Check server, PostgreSQL, and Redis health.
- **Response**: `200 OK` when both dependencies are available; otherwise `503 Service Unavailable`.
- **Data**: Overall status, timestamp, total response time, server uptime, and per-dependency status and response times.

## Auth Module (`/api/auth`)

### `POST /api/auth/register`

- **Auth**: Public
- **Purpose**: Create an account and start an authenticated session.
- **Body**: `username` (3-20 characters), `email`, `displayName` (2-30 characters), `password`, and matching `confirmPassword`. Passwords require at least eight characters with uppercase, lowercase, number, and a supported special character.
- **Response**: `201 Created` with the public user and an access token.
- **Cookie**: Sets the HTTP-only `refresh_token` cookie.
- **Errors**: `409 Conflict` when the username or email already exists.

### `POST /api/auth/login`

- **Auth**: Public
- **Body**: `email`, `password`.
- **Response**: `200 OK` with the public user and an access token; sets the HTTP-only `refresh_token` cookie.
- **Errors**: `401 Unauthorized` for invalid credentials.

### `POST /api/auth/refresh`

- **Auth**: Refresh cookie; no bearer token required.
- **Purpose**: Validate and rotate the stored refresh token.
- **Body**: None.
- **Response**: `200 OK` with a new access token and rotated `refresh_token` cookie. The previous token is revoked.
- **Errors**: `401 Unauthorized` for a missing, invalid, expired, revoked, or unknown refresh token.

### `POST /api/auth/logout`

- **Auth**: Refresh cookie when present; no bearer token required.
- **Purpose**: Revoke the active refresh token and clear its cookie.
- **Body**: None.
- **Response**: `200 OK`.
- **Idempotency**: Repeated requests and requests without a cookie are safe.

## Auctions Module (`/api/auctions`)

### `GET /api/auctions`

- **Auth**: Required.
- **Purpose**: List auctions with filtering, sorting, and offset pagination.
- **Query**:
  - `category`: Category slug.
  - `status`: `DRAFT`, `SCHEDULED`, `LIVE`, `ENDED`, or `CANCELLED`.
  - `minPrice`, `maxPrice`: Non-negative decimal strings with at most two decimal places; minimum cannot exceed maximum.
  - `sort`: `newest` (default), `endingSoon`, `startingSoon`, `priceAsc`, or `priceDesc`.
  - `page`: 1-10,000; defaults to 1.
  - `limit`: 1-50; defaults to 20.
- **Response**: `200 OK` with auction summaries and `page`, `limit`, `total`, `totalPages`, `hasNextPage`, and `hasPreviousPage`.

### `POST /api/auctions`

- **Auth**: Required.
- **Purpose**: Create an auction for the authenticated seller.
- **Body**: `title` (3-200 characters), optional `description` (up to 1,000), positive `startingPrice`, positive `bidIncrement`, `startTime`, `endTime`, optional `auctionImages` (up to 10 URLs), and optional `categorySlug`. End time must follow start time and be in the future.
- **Response**: `201 Created` with the auction ID.
- **Lifecycle**: Future auctions are `SCHEDULED`; auctions whose start time has arrived are created as `LIVE`.
- **Side Effects**: Schedules lifecycle jobs and publishes `auction:started` when immediately live.

### `GET /api/auctions/:id`

- **Auth**: Required.
- **Purpose**: Fetch prices, lifecycle status, images, category, and public seller details.
- **Response**: `200 OK` with the auction.
- **Errors**: `404 Not Found` when it does not exist.

### `PATCH /api/auctions/:id`

- **Auth**: Required; the user must own the auction.
- **Purpose**: Replace the editable configuration of a scheduled auction.
- **Body**: Same validated fields as auction creation.
- **Lifecycle Rule**: Only `SCHEDULED` auctions can be edited. Ownership and status are verified under a database row lock in the update transaction.
- **Response**: `200 OK` with the auction ID.
- **Errors**: `403 Forbidden` for a non-owner; `404 Not Found` for the auction or category; `409 Conflict` if no longer scheduled.
- **Side Effect**: Replaces start and end jobs using the updated schedule.

### `PATCH /api/auctions/:id/cancel`

- **Auth**: Required; the user must own the auction.
- **Purpose**: Cancel a scheduled auction without deleting its history.
- **Body**: None.
- **Lifecycle Rule**: Only `SCHEDULED` auctions can be cancelled. Ownership and status are verified under a row lock in the cancellation transaction.
- **Response**: `200 OK` with the auction ID.
- **Errors**: `403 Forbidden` for a non-owner; `404 Not Found`; `409 Conflict` if no longer scheduled.
- **Side Effect**: Marks the auction `CANCELLED` and removes pending lifecycle jobs.

Deleting auctions is not supported. A `CANCELLED` auction cannot be reactivated.

## Bids Module (`/api/auctions/:id/bids`)

### `POST /api/auctions/:id/bids`

- **Auth**: Required.
- **Body**: `amount`, a positive decimal string with at most two decimal places.
- **Rules**: Auction must be `LIVE`; the seller cannot bid; amount must be at least `currentPrice + bidIncrement`.
- **Response**: `201 Created` with `bidId`, `bidderId`, `amount`, and `createdAt`.
- **Errors**: `400 Bad Request` below minimum; `403 Forbidden` for the seller; `404 Not Found`; `409 Conflict` when not live.
- **Side Effect**: Publishes `auction:bid` after commit for Socket.IO broadcast.

### `GET /api/auctions/:id/bids`

- **Auth**: Required.
- **Purpose**: Return bids from most recent to oldest.
- **Response**: `200 OK` with bid IDs, amounts, timestamps, and public bidder details.

## Users Module (`/api/users`)

### `GET /api/users/me`

- **Auth**: Required.
- **Purpose**: Return the authenticated user's public profile.
- **Response**: `200 OK` with `id`, `username`, `displayName`, and `avatarUrl`. Password, tokens, email, role, and verification state are excluded.

### `PATCH /api/users/me`

- **Auth**: Required.
- **Body**: At least one of `username` (3-20 characters), `displayName` (2-30), or `avatarUrl` (valid URL or `null`).
- **Response**: `200 OK` with the updated public profile.
- **Protection**: Unknown and protected fields such as role and verification status are rejected.
- **Errors**: `409 Conflict` when the username already exists.

### `GET /api/users/me/auctions`

- **Auth**: Required.
- **Purpose**: Return auctions created by the authenticated user.
- **Query**: Optional auction `cursor`, `limit` (1-50, default 20), and optional `status`.
- **Response**: `200 OK` with auction summaries and cursor pagination: `limit`, `hasMore`, `nextCursor`.

### `GET /api/users/me/bids`

- **Auth**: Required.
- **Purpose**: Return the user's bids, most recent first, with auction details.
- **Query**: Optional bid `cursor`; `limit` from 1-50, default 20.
- **Response**: `200 OK` with bid history and cursor pagination: `limit`, `hasMore`, `nextCursor`.

### `GET /api/users/me/wins`

- **Auth**: Required.
- **Purpose**: Return auctions won by the user from persisted settlement results.
- **Query**: Optional auction `cursor`; `limit` from 1-50, default 20.
- **Response**: `200 OK` with won auctions, winning-bid details, and cursor pagination: `limit`, `hasMore`, `nextCursor`.
