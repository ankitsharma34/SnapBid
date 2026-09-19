import { createClient, type RedisClientType } from "redis";

import { env } from "../config/env.js";
import { logger } from "../config/logger.js";

const publisher: RedisClientType = createClient({
  url: env.REDIS_URL,
});

const subscriber: RedisClientType = createClient({
  url: env.REDIS_URL,
});

publisher.on("error", (error) => {
  logger.error({ error }, "Redis publisher error");
});

subscriber.on("error", (error) => {
  logger.error({ error }, "Redis subscriber error");
});

const SOCKET_EVENTS_CHANNEL = "snapbid:socket-events";

export const initializeSocketEventSubscriber = async (
  handler: (message: string) => Promise<void>,
) => {
  await subscriber.connect();

  await subscriber.subscribe(SOCKET_EVENTS_CHANNEL, async (message) => {
    try {
      await handler(message);
    } catch (error) {
      logger.error({ error }, "Failed to process socket event");
    }
  });

  logger.info(
    { channel: SOCKET_EVENTS_CHANNEL },
    "Socket event subscriber initialized",
  );
};

export const publishSocketEvent = async (message: string) => {
  if (!publisher.isOpen) {
    await publisher.connect();
  }

  await publisher.publish(SOCKET_EVENTS_CHANNEL, message);
};

export const closeSocketEventRedis = async () => {
  if (publisher.isOpen) {
    await publisher.quit();
  }

  if (subscriber.isOpen) {
    await subscriber.quit();
  }
};
