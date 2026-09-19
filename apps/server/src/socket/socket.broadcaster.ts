import { getSocketServer } from "./socket.js";
import { auctionRoom } from "./socket.rooms.js";

import type { SocketEvent } from "./socket.events.js";

export const broadcastSocketEvent = (event: SocketEvent) => {
  const io = getSocketServer();

  switch (event.event) {
    case "auction:started": {
      io.to(auctionRoom(event.payload.auctionId)).emit(
        "auction:started",
        event.payload,
      );

      break;
    }

    case "auction:ended": {
      io.to(auctionRoom(event.payload.auctionId)).emit(
        "auction:ended",
        event.payload,
      );

      break;
    }
  }
};
