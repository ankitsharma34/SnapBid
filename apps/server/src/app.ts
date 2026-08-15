import express, { type Request, type Response } from "express";
import { loggerMiddleware } from "./middlewares/logger.middleware.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { notFoundMiddleware } from "./middlewares/not-found.middleware.js";
import healthRouter from "./modules/health/health.route.js";
import authRouter from "./modules/auth/auth.route.js";
import auctionRouter from "./modules/auction/auction.route.js";

const app = express();

// middlewares
app.use(express.json());
app.use(loggerMiddleware);

// routes
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ success: true, message: "SnapBid Server is running" });
});

app.use("/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/auctions", auctionRouter);

app.use(errorMiddleware);
app.use(notFoundMiddleware);

export default app;
