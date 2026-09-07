import { Queue } from "bullmq";
import { redisConnection } from "../redis/redis.js";

export const auctionQueue = new Queue("auction", {
  connection: redisConnection,
});
