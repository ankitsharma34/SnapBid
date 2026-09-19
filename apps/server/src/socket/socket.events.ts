import type {
  AuctionEndedPayload,
  AuctionStartedPayload,
} from "./socket.types.js";

export type SocketEventMap = {
  "auction:started": AuctionStartedPayload;
  "auction:ended": AuctionEndedPayload;
};

export type SocketEventName = keyof SocketEventMap;

export type SocketEvent =
  | {
      event: "auction:started";
      payload: AuctionStartedPayload;
    }
  | {
      event: "auction:ended";
      payload: AuctionEndedPayload;
    };
