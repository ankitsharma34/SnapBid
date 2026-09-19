import { createClient } from "redis";

import { env } from "../config/env.js";
import { logger } from "../config/logger.js";

const publisher = createClient({
  url: env.REDIS_URL,
});

publisher.on("error", (error) => {
  logger.error({ error }, "Redis socket event publisher error");
});

const SOCKET_EVENTS_CHANNEL = "snapbid:socket-events";

export const initializeSocketEventPublisher = async () => {
  if (!publisher.isOpen) {
    await publisher.connect();
  }
};

export const publishSocketEvent = async <TPayload>({
  event,
  payload,
}: {
  event: string;
  payload: TPayload;
}) => {
  if (!publisher.isOpen) {
    await publisher.connect();
  }

  await publisher.publish(
    SOCKET_EVENTS_CHANNEL,
    JSON.stringify({
      event,
      payload,
    }),
  );
};

export const closeSocketEventPublisher = async () => {
  if (publisher.isOpen) {
    await publisher.quit();
  }
};
