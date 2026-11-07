import { AuctionError } from "../errors/auction-error.js";
import {
  finalizeAuction,
  findAuctionForLifecycle,
  markAuctionAsLive,
} from "../repositories/auction-lifecycle.repository.js";
import {
  endAuctionValidationError,
  startAuctionValidationError,
} from "./auction-lifecycle.rules.js";

export const startAuctionService = async (auctionId: string) => {
  const auction = await findAuctionForLifecycle(auctionId);

  if (!auction) {
    throw new AuctionError("Auction not found", "AUCTION_NOT_FOUND");
  }

  const now = new Date();

  if (auction.status === "LIVE") {
    return {
      started: false,
      alreadyLive: true,
      startedAt: null,
    };
  }

  const validationError = startAuctionValidationError(auction, now);

  if (validationError === "INVALID_AUCTION_STATE") {
    throw new AuctionError(
      `Auction cannot be started from ${auction.status} state`,
      validationError,
    );
  }

  if (validationError === "AUCTION_NOT_STARTED") {
    throw new AuctionError(
      "Auction start time has not been reached",
      validationError,
    );
  }

  if (validationError === "AUCTION_ALREADY_ENDED") {
    throw new AuctionError("Auction has already ended", validationError);
  }

  const started = await markAuctionAsLive(auctionId, now);

  if (!started) {
    throw new AuctionError(
      "Auction could not be started because its state changed",
      "INVALID_AUCTION_STATE",
    );
  }

  return {
    started: true,
    alreadyLive: false,
    startedAt: now,
  };
};

export const endAuctionService = async (auctionId: string) => {
  const auction = await findAuctionForLifecycle(auctionId);
  if (!auction) {
    throw new AuctionError("Auction not found", "AUCTION_NOT_FOUND");
  }
  const now = new Date();

  if (auction.status === "ENDED") {
    return {
      ended: false,
      alreadyEnded: true,
      endedAt: null,
      winner: null,
    };
    // Auction is already ended, no action needed
  }

  const validationError = endAuctionValidationError(auction, now);

  if (validationError === "INVALID_AUCTION_STATE") {
    throw new AuctionError(
      `Auction cannot be ended from ${auction.status} state`,
      validationError,
    );
  }

  if (validationError === "INVALID_AUCTION_TIME") {
    throw new AuctionError(
      "Auction end time has not been reached",
      validationError,
    );
  }

  // finalize the auction, e.g., mark as ended, determine the winner, etc.
  const result = await finalizeAuction(auctionId, now);

  if (!result.ended) {
    if (result.status === "ENDED") {
      return {
        ended: false,
        alreadyEnded: true,
        endedAt: null,
        winner: null,
      };
    }

    throw new AuctionError(
      "Auction could not be ended because its state changed",
      "INVALID_AUCTION_STATE",
    );
  }

  return {
    ended: true,
    alreadyEnded: false,
    endedAt: now,
    winner: result.winner,
  };
};
