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

  await publishSocketEvent(
    JSON.stringify({
      event: "auction:bid",
      payload: {
        auctionId: auctionId,
        bid: {
          id: result.bid.id,
          bidderId: result.bid.bidderId,
          amount: result.bid.amount.toString(),
          createdAt: result.bid.createdAt.toISOString(),
        },
        currentPrice: result.currentPrice.toString(),
      },
    }),
  );

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
