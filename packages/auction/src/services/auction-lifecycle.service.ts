import { AuctionError } from "../errors/auction-error.js";
import {
  finalizeAuction,
  findAuctionForLifecycle,
  markAuctionAsLive,
} from "../repositories/auction-lifecycle.repository.js";

export const startAuctionService = async (auctionId: string) => {
  const auction = await findAuctionForLifecycle(auctionId);

  if (!auction) {
    throw new AuctionError("Auction not found", "AUCTION_NOT_FOUND");
  }

  const now = new Date();

  if (auction.status === "LIVE") {
    return; // Auction is already live, no action needed
  }

  if (auction.status !== "SCHEDULED") {
    throw new AuctionError(
      `Auction cannot be started from ${auction.status} state`,
      "INVALID_AUCTION_STATE",
    );
  }

  if (auction.startTime > now) {
    throw new AuctionError(
      "Auction start time has not been reached",
      "AUCTION_NOT_STARTED",
    );
  }

  if (auction.endTime <= now) {
    throw new AuctionError(
      "Auction has already ended",
      "AUCTION_ALREADY_ENDED",
    );
  }

  const started = await markAuctionAsLive(auctionId, now);

  if (!started) {
    throw new AuctionError(
      "Auction could not be started because its state changed",
      "INVALID_AUCTION_STATE",
    );
  }
};

export const endAuctionService = async (auctionId: string) => {
  const auction = await findAuctionForLifecycle(auctionId);
  if (!auction) {
    throw new AuctionError("Auction not found", "AUCTION_NOT_FOUND");
  }
  const now = new Date();

  if (auction.status === "ENDED") {
    return; // Auction is already ended, no action needed
  }

  if (auction.status !== "LIVE") {
    throw new AuctionError(
      `Auction cannot be ended from ${auction.status} state`,
      "INVALID_AUCTION_STATE",
    );
  }

  if (auction.endTime > now) {
    throw new AuctionError(
      "Auction end time has not been reached",
      "INVALID_AUCTION_TIME",
    );
  }

  // finalize the auction, e.g., mark as ended, determine the winner, etc.
  await finalizeAuction(auctionId, now);
};
