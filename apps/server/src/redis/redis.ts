import { createClient } from "redis";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { Redis } from "ioredis";

export const redis = createClient({
  url: env.REDIS_URL,
});

redis.on("connect", () => {
  logger.info("Redis connected successfully");
});

redis.on("error", (err: Error) => {
  logger.error(`Redis Error:", ${err}`);
});

export const redisConnection = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
});
