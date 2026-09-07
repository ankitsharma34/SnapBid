import { auctionQueue } from "../queues/auction.queue.js";

export const scheduleAuctionEnd = async ({
  auctionId,
  endTime,
}: {
  auctionId: string;
  endTime: Date;
}) => {
  const delay = endTime.getTime() - Date.now();

  if (delay <= 0) {
    throw new Error("Auction end time must be in the future");
  }

  const job = await auctionQueue.add(
    "END_AUCTION",
    {
      auctionId,
    },
    {
      delay,
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 1000,
      },

      removeOnComplete: {
        count: 100,
      },

      removeOnFail: {
        count: 500,
      },
    },
  );

  return job;
};
