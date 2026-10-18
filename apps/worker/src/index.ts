import { prisma } from "@snapbid/database";
import { auctionWorker } from "./workers/auction.worker.js";
import { redisConnection } from "./infrastructure/redis.js";
import { closeSocketEventPublisher } from "./infrastructure/redis.pubsub.js";

console.log("SnapBid Worker started");

let isShuttingDown = false;

const shutdown = async (signal: string) => {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  console.log(`${signal} received. Shutting down worker...`);

  // Stop accepting work and wait for the active job before closing resources
  // that lifecycle processing may still be using.
  const workerResults = await Promise.allSettled([auctionWorker.close()]);
  const infrastructureResults = await Promise.allSettled([
    closeSocketEventPublisher(),
    redisConnection.quit(),
    prisma.$disconnect(),
  ]);

  const results = [...workerResults, ...infrastructureResults];
  const failed = results.filter((result) => result.status === "rejected");

  if (failed.length > 0) {
    console.error("Worker shutdown completed with errors", failed);
    process.exit(1);
  }

  process.exit(0);
};

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
