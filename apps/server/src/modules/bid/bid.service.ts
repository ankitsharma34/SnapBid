import { publishSocketEvent } from "../../redis/redis.pubsub.js";
import { findBidHistoryByAuctionId, placeBid } from "./bid.repository.js";

export const postBidService = async ({
  auctionId,
  bidderId,
  inputAmount,
}: {
  auctionId: string;
  bidderId: string;
  inputAmount: string;
}) => {
  const result = await placeBid({
    auctionId,
    bidderId,
    inputAmount,
  });

  return result.bid;
};

export const getBidHistoryService = async ({
  auctionId,
}: {
  auctionId: string;
}) => {
  const bidHistory = await findBidHistoryByAuctionId(auctionId);
  return bidHistory;
};
