import { createClient } from "redis";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";

export const redis = createClient({
  url: env.REDIS_URL,
});

redis.on("connect", () => {
  logger.info("Redis connected successfully");
});

redis.on("error", (err: Error) => {
  logger.error(`Redis Error:", ${err}`);
});
