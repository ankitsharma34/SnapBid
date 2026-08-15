import { AppError } from "../../utils/app-error.js";
import { toAuctionResponse, toAuctionsListResponse } from "./auction.mapper.js";
import { findAllAuctions, findAuctionById } from "./auction.repository.js";

export const getAuctionsService = async () => {
  const auctions = await findAllAuctions();
  return toAuctionsListResponse(auctions);
};

export const getAuctionByIdService = async (id: string) => {
  const auction = await findAuctionById(id);
  if (!auction) {
    throw new AppError("Auction not found", 404);
  }
  return toAuctionResponse(auction);
};
