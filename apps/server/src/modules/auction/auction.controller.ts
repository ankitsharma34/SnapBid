import { Request, Response } from "express";
import {
  getAuctionByIdService,
  getAuctionsService,
} from "./auction.service.js";
import { auctionIdParamsSchema } from "./auction.schema.js";

export const getAuctions = async (_req: Request, res: Response) => {
  const auctions = await getAuctionsService();

  return res.status(200).json({
    success: true,
    message: "Auctions fetched successfully",
    data: auctions,
  });
};

export const getAuctionById = async (req: Request, res: Response) => {
  const { id } = auctionIdParamsSchema.parse(req.params);

  const auction = await getAuctionByIdService(id);

  return res.status(200).json({
    success: true,
    message: "Auction fetched successfully",
    data: auction,
  });
};
