import { auctionWorker } from "./workers/auction.worker.js";

console.log("SnapBid Worker started");

const shutdown = async (signal: string) => {
  console.log(`${signal} received. Shutting down worker...`);

  await auctionWorker.close();

  process.exit(0);
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
