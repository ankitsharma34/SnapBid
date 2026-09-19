import { logger } from "../../config/logger.js";
import { validateAuctionRoomJoin } from "../../modules/auction/auction.socket.service.js";
import { auctionRoom } from "../socket.rooms.js";
import type { SnapBidSocket } from "../socket.types.js";

const isValidAuctionId = (auctionId: string): boolean => {
  return typeof auctionId === "string" && auctionId.trim().length > 0;
};

export const registerAuctionSocketHandlers = (socket: SnapBidSocket) => {
  socket.on("auction:join", async (auctionId) => {
    try {
      if (!isValidAuctionId(auctionId)) {
        socket.emit("auction:error", {
          message: "Invalid auction ID",
        });
        return;
      }

      const exists = await validateAuctionRoomJoin(auctionId);
      if (!exists) {
        socket.emit("auction:error", {
          message: "Auction not found",
        });
        return;
      }

      const room = auctionRoom(auctionId);
      await socket.join(room);

      logger.info(
        {
          socketId: socket.id,
          userId: socket.data.user.userId,
          auctionId,
          room,
        },
        "Socket joined auction room",
      );

      socket.emit("auction:joined", {
        auctionId,
      });
    } catch (error) {
      logger.error(
        {
          error,
          socketId: socket.id,
          userId: socket.data.user.userId,
          auctionId,
        },
        "Failed to join auction room",
      );

      socket.emit("auction:error", {
        message: "Failed to join auction room",
      });
    }
  });

  socket.on("auction:leave", async (auctionId) => {
    try {
      if (!isValidAuctionId(auctionId)) {
        socket.emit("auction:error", {
          message: "Invalid auction ID",
        });
        return;
      }

      const room = auctionRoom(auctionId);
      await socket.leave(room);

      logger.info(
        {
          socketId: socket.id,
          userId: socket.data.user.userId,
          auctionId,
          room,
        },
        "Socket left auction room",
      );

      socket.emit("auction:left", {
        auctionId,
      });
    } catch (error) {
      logger.error(
        {
          error,
          socketId: socket.id,
          userId: socket.data.user.userId,
          auctionId,
        },
        "Failed to leave auction room",
      );

      socket.emit("auction:error", {
        message: "Failed to leave auction room",
      });
    }
  });
};
