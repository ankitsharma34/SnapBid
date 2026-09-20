# Socket.IO Architecture

## Initialization and Authentication

The Socket.IO server is initialized within `apps/server/src/socket/socket.ts` and attaches to the Express HTTP server.

Authentication is strictly enforced using middleware. Clients must provide a valid JWT access token either via `auth.token` during the handshake, or via the standard `Authorization: Bearer <token>` header. If authentication fails, the connection is rejected.

Upon successful authentication, the decoded `userId` is attached to `socket.data.user`, and the socket is immediately joined to a personal user room (`user:<userId>`).

## Room Management

SnapBid uses Socket.IO rooms to broadcast events to specific subsets of users.

### Auction Rooms

- **Format**: `auction:<auctionId>`
- **Purpose**: Broadcasts events related to a specific auction (bids, start, end).
- **Validation**: When a client requests to join an auction room, `validateAuctionRoomJoin` verifies that the auction exists in the database.

### Joining and Leaving

Clients manage their room subscriptions by sending explicit events to the server.

- **`auction:join`**: Client requests to join a room. Server validates the ID, joins the socket to the room, and responds with `auction:joined`.
- **`auction:leave`**: Client requests to leave a room. Server removes the socket from the room and responds with `auction:left`.
- If an error occurs (invalid ID, non-existent auction), the server responds with an `auction:error` event to that specific client.

## Event Contracts

The server broadcasts specific events to auction rooms. These events map to the internal Redis Pub/Sub events.

### Server-to-Client Events

_These are emitted by the server and listened to by the client._

- `auction:started`: Emitted when the Worker transitions the auction to `LIVE`.
- `auction:bid`: Emitted when a new bid is successfully placed and committed to the database. Contains bid details and the updated `currentPrice`.
- `auction:ended`: Emitted when the Worker transitions the auction to `ENDED`. Contains winner information (if any).
- `auction:error`: Emitted directly to a client if a socket operation fails.

### Client-to-Server Events

_These are emitted by the client and listened to by the server._

- `auction:join`: Request to subscribe to updates for a specific auction.
- `auction:leave`: Request to unsubscribe from updates.

> **Note:** There is NO `auction:placeBid` client-to-server event. Bids must be placed via the HTTP REST API.

## Scalability Considerations (Future)

> **Status:** Future consideration

Currently, SnapBid operates with a single Socket.IO server instance. Therefore, a Socket.IO Redis Adapter (which broadcasts Socket.IO events across multiple Socket.IO server nodes) is **not currently required or implemented**.

If SnapBid scales horizontally to multiple Node.js server instances in the future, the `@socket.io/redis-adapter` will need to be implemented so that a client connected to `Server A` receives events triggered by `Server B`.
