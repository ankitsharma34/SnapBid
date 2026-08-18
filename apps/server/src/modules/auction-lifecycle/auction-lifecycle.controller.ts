import {
  endAuctionService,
  startAuctionService,
} from "./auction-lifecycle.service.js";

export const startAuction = async (auctionId: string) => {
  await startAuctionService(auctionId);
};

export const endAuction = async (auctionId: string) => {
  await endAuctionService(auctionId);
};
