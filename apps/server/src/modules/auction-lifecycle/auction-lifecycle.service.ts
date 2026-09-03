import { AppError } from "../../utils/app-error.js";
import {
  finalizeAuction,
  findAuctionForLifecycle,
  markAuctionAsLive,
} from "./auction-lifecycle.repository.js";

export const startAuctionService = async (auctionId: string) => {
  const auction = await findAuctionForLifecycle(auctionId);

  if (!auction) {
    throw new AppError("Auction not found", 404);
  }

  const now = new Date();

  if (auction.status === "LIVE") {
    return; // Auction is already live, no action needed
  }

  if (auction.status !== "SCHEDULED") {
    throw new AppError(
      `Auction cannot be started from ${auction.status} state`,
      409,
    );
  }

  if (auction.startTime > now) {
    throw new AppError("Auction start time has not been reached", 409);
  }

  if (auction.endTime <= now) {
    throw new AppError("Auction has already ended", 409);
  }

  const started = await markAuctionAsLive(auctionId, now);

  if (!started) {
    throw new AppError(
      "Auction could not be started because its state changed",
      409,
    );
  }
};

export const endAuctionService = async (auctionId: string) => {
  const auction = await findAuctionForLifecycle(auctionId);
  if (!auction) {
    throw new AppError("Auction not found", 404);
  }
  const now = new Date();

  if (auction.status === "ENDED") {
    return; // Auction is already ended, no action needed
  }

  if (auction.status !== "LIVE") {
    throw new AppError(
      `Auction cannot be ended from ${auction.status} state`,
      409,
    );
  }

  if (auction.endTime > now) {
    throw new AppError("Auction end time has not been reached", 409);
  }

  // finalize the auction, e.g., mark as ended, determine the winner, etc.
  await finalizeAuction(auctionId, now);
};
