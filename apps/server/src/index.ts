import { createServer } from "node:http";
import app from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { redis } from "./redis/redis.js";
import { initializeSocketServer } from "./socket/socket.js";

const PORT = env.PORT;
const httpServer = createServer(app);

initializeSocketServer(httpServer);

await redis.connect();

httpServer.listen(PORT, () => {
  logger.info(`SnapBid Server is running on PORT: ${PORT}`);
});
