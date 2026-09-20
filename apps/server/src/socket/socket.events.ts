import type {
  AuctionBidPayload,
  AuctionEndedPayload,
  AuctionStartedPayload,
} from "./socket.types.js";

export type SocketEventMap = {
  "auction:started": AuctionStartedPayload;
  "auction:ended": AuctionEndedPayload;
  "auction:bid": AuctionBidPayload;
};

export type SocketEventName = keyof SocketEventMap;

export type SocketEvent = {
  [K in keyof SocketEventMap]: {
    event: K;
    payload: SocketEventMap[K];
  };
}[keyof SocketEventMap];
