# Authentication Architecture

## Overview

SnapBid uses a custom JWT-based authentication system.

## Mechanisms

- **Password Hashing**: Argon2 is used to securely hash and verify user passwords before saving them to the database.
- **Access Tokens**: Short-lived JWTs (JSON Web Tokens) returned to the client upon login. The client includes this token in the `Authorization: Bearer <token>` header for HTTP API requests.
- **Refresh Tokens**: Long-lived tokens stored in an HTTP-only cookie and in the database (`RefreshToken` model). When an access token expires, the client hits a refresh endpoint, providing the cookie, to obtain a new access token.

## HTTP Authentication

HTTP requests are protected by the `authenticate.ts` middleware.

- It extracts the Bearer token from the header.
- Verifies the signature using `verifyAccessToken` (`utils/jwt.ts`).
- Attaches the decoded payload (`userId`, `role`) to the Express `req.user` object.
- If invalid or missing, returns `401 Unauthorized`.

## Socket Authentication

Socket.IO connections are protected by middleware inside `socket.ts`.
Because WebSockets do not always easily send custom HTTP headers during the upgrade request from browser clients, the socket middleware accepts the token from two locations:

1. `socket.handshake.auth.token` (Socket.IO client auth object)
2. `socket.handshake.headers.authorization` (Standard Bearer header)

If the token is valid, the data is attached to `socket.data.user`, and the socket is allowed to connect. If invalid, the connection is forcibly closed.

## Role Handling

The `User` model includes a `role` enum (`USER`, `ADMIN`). The JWT payload includes this role, allowing for future RBAC (Role-Based Access Control) implementation in the route middlewares. Currently, all standard auction flows rely simply on being an authenticated `USER`.
