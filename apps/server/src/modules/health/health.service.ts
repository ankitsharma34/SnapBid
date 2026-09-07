import { prisma } from "@snapbid/database";
import { redis } from "../../redis/redis.js";

export const healthCheck = async () => {
  const startedAt = Date.now();

  const server = {
    status: "UP",
    uptime: process.uptime(),
  };

  let database = {
    status: "DOWN",
    responseTime: 0,
  };

  let cache = {
    status: "DOWN",
    responseTime: 0,
  };

  // Database Check
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;

    database = {
      status: "UP",
      responseTime: Date.now() - start,
    };
  } catch {
    database.status = "DOWN";
  }

  // Redis Check
  try {
    const start = Date.now();
    await redis.ping();

    cache = {
      status: "UP",
      responseTime: Date.now() - start,
    };
  } catch {
    cache.status = "DOWN";
  }

  const healthy = database.status === "UP" && cache.status === "UP";

  return {
    status: healthy ? "UP" : "DOWN",
    timestamp: new Date().toISOString(),
    responseTime: `${Date.now() - startedAt}ms`,
    services: {
      server,
      database,
      redis: cache,
    },
  };
};
