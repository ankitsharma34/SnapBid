import { findAuctionById } from "./auction.repository.js";

export const validateAuctionRoomJoin = async (
  auctionId: string,
): Promise<boolean> => {
  const auction = await findAuctionById(auctionId);

  return auction !== null;
};
