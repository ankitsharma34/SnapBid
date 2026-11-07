import type { AuctionErrorCode } from "../errors/auction-error.js";

type AuctionLifecycleInput = {
  status: string;
  startTime: Date;
  endTime: Date;
};

export const startAuctionValidationError = (
  auction: AuctionLifecycleInput,
  now: Date,
): AuctionErrorCode | null => {
  if (auction.status !== "SCHEDULED") return "INVALID_AUCTION_STATE";
  if (auction.startTime > now) return "AUCTION_NOT_STARTED";
  if (auction.endTime <= now) return "AUCTION_ALREADY_ENDED";

  return null;
};

export const endAuctionValidationError = (
  auction: AuctionLifecycleInput,
  now: Date,
): AuctionErrorCode | null => {
  if (auction.status !== "LIVE") return "INVALID_AUCTION_STATE";
  if (auction.endTime > now) return "INVALID_AUCTION_TIME";

  return null;
};
