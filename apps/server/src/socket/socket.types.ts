import type { Socket } from "socket.io";

export type SocketUser = {
  userId: string;
  role: string;
};

export type AuctionStartedPayload = {
  auctionId: string;
  status: "LIVE";
  startedAt: string;
};

export type AuctionEndedPayload = {
  auctionId: string;
  status: "ENDED";
  winner: {
    userId: string;
    bidId: string;
    amount: string;
  } | null;
  endedAt: string;
};

export type ServerToClientEvents = {
  connected: (payload: { userId: string }) => void;
  "auction:joined": (payload: { auctionId: string }) => void;
  "auction:left": (payload: { auctionId: string }) => void;

  "auction:started": (payload: AuctionStartedPayload) => void;
  "auction:ended": (payload: AuctionEndedPayload) => void;

  "auction:error": (payload: { message: string }) => void;
};

export type ClientToServerEvents = {
  "auction:join": (auctionId: string) => void;
  "auction:leave": (auctionId: string) => void;
};

export type InterServerEvents = Record<string, never>;

export type SocketData = {
  user: SocketUser;
};

export type SnapBidSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;
