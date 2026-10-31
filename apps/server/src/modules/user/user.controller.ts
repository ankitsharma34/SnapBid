import type { Request, Response } from "express";
import type {
  SellerAuctionHistoryQuery,
  UpdateUserProfileInput,
  UserBidHistoryQuery,
} from "@snapbid/shared";
import {
  getValidatedBody,
  getValidatedQuery,
} from "../../middlewares/validate-request.js";
import {
  getCurrentUserProfileService,
  getSellerAuctionHistoryService,
  getUserBidHistoryService,
  updateCurrentUserProfileService,
} from "./user.service.js";

export const getCurrentUserProfile = async (req: Request, res: Response) => {
  const profile = await getCurrentUserProfileService(req.user!.userId);

  return res.status(200).json({
    success: true,
    message: "User profile fetched successfully",
    data: profile,
  });
};

export const patchCurrentUserProfile = async (req: Request, res: Response) => {
  const input = getValidatedBody<UpdateUserProfileInput>(req);
  const profile = await updateCurrentUserProfileService(
    req.user!.userId,
    input,
  );

  return res.status(200).json({
    success: true,
    message: "User profile updated successfully",
    data: profile,
  });
};

export const getSellerAuctionHistory = async (req: Request, res: Response) => {
  const query = getValidatedQuery<SellerAuctionHistoryQuery>(req);
  const result = await getSellerAuctionHistoryService(req.user!.userId, query);

  return res.status(200).json({
    success: true,
    message: "Seller auction history fetched successfully",
    data: result.auctions,
    pagination: result.pagination,
  });
};

export const getUserBidHistory = async (req: Request, res: Response) => {
  const query = getValidatedQuery<UserBidHistoryQuery>(req);
  const result = await getUserBidHistoryService(req.user!.userId, query);

  return res.status(200).json({
    success: true,
    message: "User bid history fetched successfully",
    data: result.bids,
    pagination: result.pagination,
  });
};
