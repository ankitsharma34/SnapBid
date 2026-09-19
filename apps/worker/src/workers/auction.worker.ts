import { Worker } from "bullmq";
import { redisConnection } from "../infrastructure/redis.js";
import { endAuctionService, startAuctionService } from "@snapbid/auction";
import { publishSocketEvent } from "../infrastructure/redis.pubsub.js";

export const auctionWorker = new Worker(
  "auction",

  async (job) => {
    const { auctionId } = job.data;

    switch (job.name) {
      case "START_AUCTION":
        const startResult = await startAuctionService(auctionId);

        if (!startResult.started) {
          return;
        }

        await publishSocketEvent({
          event: "auction:started",
          payload: {
            auctionId,
            status: "LIVE",
            startedAt: startResult.startedAt?.toISOString(),
          },
        });

        break;

      case "END_AUCTION":
        const endResult = await endAuctionService(auctionId);

        if (!endResult.ended) {
          return;
        }

        await publishSocketEvent({
          event: "auction:ended",
          payload: {
            auctionId,
            status: "ENDED",
            winner: endResult.winner
              ? {
                  userId: endResult.winner.userId,
                  bidId: endResult.winner.bidId,
                  amount: endResult.winner.amount.toString(),
                }
              : null,
            endedAt: endResult.endedAt?.toISOString(),
          },
        });
        break;

      default:
        throw new Error(`Unknown job: ${job.name}`);
    }
  },

  {
    connection: redisConnection,
  },
);

auctionWorker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

auctionWorker.on("failed", (job, error) => {
  console.error(`Job ${job?.id} failed:`, error);
});
