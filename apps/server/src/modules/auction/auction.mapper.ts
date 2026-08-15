import { AuctionListQueryResult } from "./auction.repository.js";

export const toAuctionsListResponse = (auctions: AuctionListQueryResult) => {
  return auctions.map((auction) => ({
    id: auction.id,
    title: auction.title,
    currentPrice: auction.currentPrice.toString(),
    bidIncrement: auction.bidIncrement.toString(),
    startTime: auction.startTime,
    endTime: auction.endTime,
    status: auction.status,
    thumbnailUrl: auction.auctionImages[0]?.url ?? null,
  }));
};
