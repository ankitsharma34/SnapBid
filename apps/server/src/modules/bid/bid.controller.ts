import { Request, Response } from "express";
import { getBidHistoryService, postBidService } from "./bid.service.js";
import { auctionIdParamsSchema } from "../auction/auction.schema.js";
import { bidSchema } from "@snapbid/shared";

export const postBid = async (req: Request, res: Response) => {
  const { id } = auctionIdParamsSchema.parse(req.params);
  const { amount } = bidSchema.parse(req.body);

  const bidderId = req.user!.userId;

  const bidId = await postBidService({
    auctionId: id,
    bidderId,
    inputAmount: amount,
  });

  return res.status(201).json({
    success: true,
    message: "Bid placed successfully",
    data: { bidId },
  });
};

export const getBidHistory = async (req: Request, res: Response) => {
  const { id } = auctionIdParamsSchema.parse(req.params);

  const bidHistory = await getBidHistoryService({
    auctionId: id,
  });
  return res.status(200).json({
    success: true,
    message: "Bid history fetched successfully",
    data: bidHistory,
  });
};
