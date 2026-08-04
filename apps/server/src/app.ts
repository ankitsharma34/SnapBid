import express, { type Request, type Response } from "express";
import { loggerMiddleware } from "./middlewares/logger.middleware.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { notFoundMiddleware } from "./middlewares/not-found.middleware.js";

const app = express();

app.use(loggerMiddleware);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ success: true, message: "SnapBid Server is running" });
});

app.use(errorMiddleware);
app.use(notFoundMiddleware);

export default app;
