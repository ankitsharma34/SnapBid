import { Request, Response } from "express";
import {
  cancelAuctionService,
  createAuctionService,
  editAuctionService,
  getAuctionByIdService,
  getAuctionsService,
} from "./auction.service.js";
import { auctionIdParamsSchema } from "./auction.schema.js";
import { createAuctionSchema } from "@snapbid/shared";

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

export const postAuction = async (req: Request, res: Response) => {
  const inputData = createAuctionSchema.parse(req.body);
  const sellerId = req.user!.userId;
  const auctionId = await createAuctionService({ inputData, sellerId });

  return res.status(201).json({
    success: true,
    message: "Auction created successfully",
    data: { id: auctionId },
  });
};

export const editAuction = async (req: Request, res: Response) => {
  const { id } = auctionIdParamsSchema.parse(req.params);
  const inputData = createAuctionSchema.parse(req.body);
  const sellerId = req.user!.userId;

  await editAuctionService({ auctionId: id, sellerId, inputData });

  return res.status(200).json({
    success: true,
    message: "Auction edited successfully",
    data: { id },
  });
};

export const cancelAuction = async (req: Request, res: Response) => {
  const { id } = auctionIdParamsSchema.parse(req.params);
  const sellerId = req.user!.userId;
  await cancelAuctionService({ auctionId: id, sellerId });

  return res.status(200).json({
    success: true,
    message: "Auction cancelled successfully",
    data: { id },
  });
};
