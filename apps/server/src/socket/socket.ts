import type { Server as HttpServer } from "node:http";
import { Server, type Socket } from "socket.io";
import { logger } from "../config/logger.js";
import { verifyAccessToken } from "../utils/jwt.js";
import { env } from "../config/env.js";

type SocketUser = {
  userId: string;
  role: string;
};

type ServerToClientEvents = {
  connected: (payload: { userId: string }) => void;
};

type ClientToServerEvents = {
  "auction:join": (auctionId: string) => void;
  "auction:leave": (auctionId: string) => void;
};

type InterServerEvents = Record<string, never>;

type SocketData = {
  user: SocketUser;
};

export type SnapBidSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

let io: Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
> | null = null;

const getTokenFromSocket = (socket: SnapBidSocket) => {
  const authToken = socket.handshake.auth.token;

  if (typeof authToken === "string") {
    return authToken;
  }

  const authHeader = socket.handshake.headers.authorization;
  if (!authHeader) {
    return null;
  }

  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) {
    return null;
  }

  return token;
};

const auctionRoom = (auctionId: string) => `auction:${auctionId}`;
const userRoom = (userId: string) => `user:${userId}`;

const registerSocketHandlers = (socket: SnapBidSocket) => {
  const { userId } = socket.data.user;

  socket.join(userRoom(userId));
  socket.emit("connected", { userId });

  logger.info({ socketId: socket.id, userId }, "Socket connected");

  socket.on("auction:join", (auctionId) => {
    socket.join(auctionRoom(auctionId));
  });

  socket.on("auction:leave", (auctionId) => {
    socket.leave(auctionRoom(auctionId));
  });

  socket.on("disconnect", (reason) => {
    logger.info({ socketId: socket.id, userId, reason }, "Socket disconnected");
  });
};

export const initializeSocketServer = (httpServer: HttpServer) => {
  io = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(httpServer, {
    cors: {
      origin: env.CLIENT_URL,
      methods: ["GET", "POST"],
    },
  });

  io.use((socket: SnapBidSocket, next) => {
    const token = getTokenFromSocket(socket);
    if (!token) {
      next(new Error("Authentication required"));
      return;
    }

    try {
      const payload = verifyAccessToken(token);
      socket.data.user = {
        userId: payload.userId,
        role: payload.role,
      };
      next();
    } catch {
      next(new Error("Invalid or expired access token"));
    }
  });

  io.on("connection", registerSocketHandlers);

  return io;
};

export const getSocketServer = () => {
  if (!io) {
    throw new Error("Socket.IO server has not been initialized");
  }

  return io;
};

export const socketRooms = {
  auction: auctionRoom,
  user: userRoom,
};
