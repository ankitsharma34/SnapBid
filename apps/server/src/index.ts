import { createServer } from "node:http";
import app from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { prisma } from "@snapbid/database";
import { redis, redisConnection } from "./redis/redis.js";
import { closeSocketEventRedis } from "./redis/redis.pubsub.js";
import {
  closeSocketServer,
  initializeSocketInfrastructure,
  initializeSocketServer,
} from "./socket/socket.js";

const PORT = env.PORT;
const httpServer = createServer(app);

initializeSocketServer(httpServer);

await redis.connect();
await initializeSocketInfrastructure();

httpServer.listen(PORT, () => {
  logger.info(`SnapBid Server is running on PORT: ${PORT}`);
});

let isShuttingDown = false;

const shutdown = async (signal: string) => {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  logger.info({ signal }, "Shutting down SnapBid server");

  await closeSocketServer();

  const results = await Promise.allSettled([
    closeSocketEventRedis(),
    redis.isOpen ? redis.quit() : Promise.resolve(),
    redisConnection.quit(),
    prisma.$disconnect(),
  ]);
  const failures = results.filter((result) => result.status === "rejected");

  if (failures.length > 0) {
    logger.error({ failures }, "Server shutdown completed with errors");
    process.exitCode = 1;
  }
};

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
