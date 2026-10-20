import { Request, Response } from "express";
import type { BidInput } from "@snapbid/shared";
import {
  getValidatedBody,
  getValidatedParams,
} from "../../middlewares/validate-request.js";
import { getBidHistoryService, postBidService } from "./bid.service.js";
import type { AuctionIdParams } from "../auction/auction.schema.js";

export const postBid = async (req: Request, res: Response) => {
  const { id } = getValidatedParams<AuctionIdParams>(req);
  const { amount } = getValidatedBody<BidInput>(req);

  const bidderId = req.user!.userId;

  const bid = await postBidService({
    auctionId: id,
    bidderId,
    inputAmount: amount,
  });

  return res.status(201).json({
    success: true,
    message: "Bid placed successfully",
    data: {
      bidId: bid.id,
      bidderId: bid.bidderId,
      amount: bid.amount.toString(),
      createdAt: bid.createdAt.toISOString(),
    },
  });
};

export const getBidHistory = async (req: Request, res: Response) => {
  const { id } = getValidatedParams<AuctionIdParams>(req);

  const bidHistory = await getBidHistoryService({
    auctionId: id,
  });
  return res.status(200).json({
    success: true,
    message: "Bid history fetched successfully",
    data: bidHistory,
  });
};
