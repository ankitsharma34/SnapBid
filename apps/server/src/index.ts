import app from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";

const PORT = env.PORT;

app.listen(PORT, () => {
  logger.info(`SnapBid Server is running on PORT: ${PORT}`);
});
