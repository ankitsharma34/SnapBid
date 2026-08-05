import { Request, Response } from "express";
import { healthCheck } from "./health.service.js";

export const getHealth = async (_req: Request, res: Response) => {
  const health = await healthCheck();
  res.status(health.status === "UP" ? 200 : 503).json(health);
};
