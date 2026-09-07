import { Worker } from "bullmq";
import { redisConnection } from "../infrastructure/redis.js";

export const auctionWorker = new Worker(
  "auction",

  async (job) => {
    const { auctionId } = job.data;

    switch (job.name) {
      case "START_AUCTION":
        // await startAuction(auctionId);
        break;

      case "END_AUCTION":
        // await endAuction(auctionId);
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
