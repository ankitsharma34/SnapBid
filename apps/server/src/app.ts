import express, { type Request, type Response } from "express";
import { loggerMiddleware } from "./middlewares/logger.middleware.js";

const app = express();

app.use(loggerMiddleware);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ success: true, message: "SnapBid Server is running" });
});

export default app;
