import { toAuctionsListResponse } from "./auction.mapper.js";
import { findAllAuctions } from "./auction.repository.js";

export const getAuctionsService = async () => {
  const auctions = await findAllAuctions();
  return toAuctionsListResponse(auctions);
};
