import { Queue } from "bullmq";
import { redisConnection } from "../infrastructure/redis.js";

export const auctionQueue = new Queue("auction", {
  connection: redisConnection,
});
