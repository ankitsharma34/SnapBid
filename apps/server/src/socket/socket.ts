import type { Server as HttpServer } from "node:http";
import { Server } from "socket.io";
import { logger } from "../config/logger.js";
import { verifyAccessToken } from "../utils/jwt.js";
import { registerAuctionSocketHandlers } from "./handlers/auction.socket.js";
import { auctionRoom, userRoom } from "./socket.rooms.js";
import type {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SnapBidSocket,
  SocketData,
} from "./socket.types.js";
import { env } from "../config/env.js";
import { initializeSocketEventSubscriber } from "../redis/redis.pubsub.js";
import { broadcastSocketEvent } from "./socket.broadcaster.js";
import { parseSocketEvent } from "./socket.event.parser.js";

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

const authenticateSocket = (
  socket: SnapBidSocket,
  next: (error?: Error) => void,
) => {
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
};

const registerSocketConnection = (socket: SnapBidSocket) => {
  const { userId } = socket.data.user;

  socket.join(userRoom(userId));

  socket.emit("connected", {
    userId,
  });

  registerAuctionSocketHandlers(socket);

  logger.info(
    {
      socketId: socket.id,
      userId,
    },
    "Socket connected",
  );

  socket.on("disconnect", (reason) => {
    logger.info(
      {
        socketId: socket.id,
        userId,
        reason,
      },
      "Socket disconnected",
    );
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

  io.use(authenticateSocket);

  io.on("connection", registerSocketConnection);

  return io;
};

export const initializeSocketInfrastructure = async () => {
  const messageHandler = async (message: string) => {
    const event = parseSocketEvent(message);

    broadcastSocketEvent(event);
  };
  await initializeSocketEventSubscriber(async (message) => {
    messageHandler(message).catch((error) => {
      logger.error({ error }, "Failed to handle socket event");
    });
  });
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
