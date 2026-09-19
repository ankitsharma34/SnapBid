import type {
  SocketEvent,
  SocketEventMap,
  SocketEventName,
} from "./socket.events.js";

const isSocketEventName = (value: unknown): value is SocketEventName => {
  return value === "auction:started" || value === "auction:ended";
};

export const parseSocketEvent = (message: string): SocketEvent => {
  const parsed: unknown = JSON.parse(message);

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !("event" in parsed) ||
    !("payload" in parsed)
  ) {
    throw new Error("Invalid socket event message");
  }

  const event = parsed.event;

  if (!isSocketEventName(event)) {
    throw new Error(`Unknown socket event: ${String(event)}`);
  }

  return parsed as SocketEvent;
};
