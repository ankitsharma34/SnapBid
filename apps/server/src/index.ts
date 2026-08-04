import app from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { redis } from "./redis/redis.js";

const PORT = env.PORT;

await redis.connect();

app.listen(PORT, () => {
  logger.info(`SnapBid Server is running on PORT: ${PORT}`);
});
