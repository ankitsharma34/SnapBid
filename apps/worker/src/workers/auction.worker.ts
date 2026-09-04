import { Worker } from "bullmq";
import { redisConnection } from "../infrastructure/redis.js";

export const auctionWorker = new Worker(
  "auction",
  async (job) => {
    console.log(`Processing job: ${job.name}`);
    console.log("Job data:", job.data);

    // Business logic will be added here later.
  },
  {
    connection: redisConnection,
  },
);

auctionWorker.on("completed", (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

auctionWorker.on("failed", (job, error) => {
  console.error(`Job ${job?.id} failed:`, error);
});
