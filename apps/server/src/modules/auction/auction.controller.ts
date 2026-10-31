import { Request, Response } from "express";
import type { AuctionListQuery, CreateAuctionInput } from "@snapbid/shared";
import {
  getValidatedBody,
  getValidatedParams,
  getValidatedQuery,
} from "../../middlewares/validate-request.js";
import {
  cancelAuctionService,
  createAuctionService,
  editAuctionService,
  getAuctionByIdService,
  getAuctionsService,
} from "./auction.service.js";
import type { AuctionIdParams } from "./auction.schema.js";

export const getAuctions = async (req: Request, res: Response) => {
  const query = getValidatedQuery<AuctionListQuery>(req);
  const result = await getAuctionsService(query);

  return res.status(200).json({
    success: true,
    message: "Auctions fetched successfully",
    data: result.auctions,
    pagination: result.pagination,
  });
};

export const getAuctionById = async (req: Request, res: Response) => {
  const { id } = getValidatedParams<AuctionIdParams>(req);

  const auction = await getAuctionByIdService(id);

  return res.status(200).json({
    success: true,
    message: "Auction fetched successfully",
    data: auction,
  });
};

export const postAuction = async (req: Request, res: Response) => {
  const inputData = getValidatedBody<CreateAuctionInput>(req);
  const sellerId = req.user!.userId;
  const auctionId = await createAuctionService({ inputData, sellerId });

  return res.status(201).json({
    success: true,
    message: "Auction created successfully",
    data: { id: auctionId },
  });
};

export const editAuction = async (req: Request, res: Response) => {
  const { id } = getValidatedParams<AuctionIdParams>(req);
  const inputData = getValidatedBody<CreateAuctionInput>(req);
  const sellerId = req.user!.userId;

  await editAuctionService({ auctionId: id, sellerId, inputData });

  return res.status(200).json({
    success: true,
    message: "Auction edited successfully",
    data: { id },
  });
};

export const cancelAuction = async (req: Request, res: Response) => {
  const { id } = getValidatedParams<AuctionIdParams>(req);
  const sellerId = req.user!.userId;
  await cancelAuctionService({ auctionId: id, sellerId });

  return res.status(200).json({
    success: true,
    message: "Auction cancelled successfully",
    data: { id },
  });
};
