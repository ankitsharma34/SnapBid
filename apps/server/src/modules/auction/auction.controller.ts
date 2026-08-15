import { Request, Response } from "express";
import { getAuctionsService } from "./auction.service.js";

export const getAuctions = async (_req: Request, res: Response) => {
  const auctions = await getAuctionsService();

  return res.status(200).json({
    success: true,
    message: "Auctions fetched successfully",
    data: auctions,
  });
};
