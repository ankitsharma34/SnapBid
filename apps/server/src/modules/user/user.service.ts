import { AppError } from "../../utils/app-error.js";
import type {
  SellerAuctionHistoryQuery,
  UpdateUserProfileInput,
} from "@snapbid/shared";
import {
  findSellerAuctions,
  findPublicUserProfileById,
  updateUserProfile,
} from "./user.repository.js";

export const getCurrentUserProfileService = async (userId: string) => {
  const profile = await findPublicUserProfileById(userId);

  if (!profile) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }

  return profile;
};

export const updateCurrentUserProfileService = (
  userId: string,
  input: UpdateUserProfileInput,
) => {
  return updateUserProfile(userId, input);
};

export const getSellerAuctionHistoryService = async (
  userId: string,
  query: SellerAuctionHistoryQuery,
) => {
  const rows = await findSellerAuctions({ userId, query });
  const hasMore = rows.length > query.limit;
  const auctions = hasMore ? rows.slice(0, query.limit) : rows;

  return {
    auctions: auctions.map((auction) => ({
      id: auction.id,
      title: auction.title,
      startingPrice: auction.startingPrice.toString(),
      currentPrice: auction.currentPrice.toString(),
      bidIncrement: auction.bidIncrement.toString(),
      startTime: auction.startTime,
      endTime: auction.endTime,
      status: auction.status,
      createdAt: auction.createdAt,
      thumbnailUrl: auction.auctionImages[0]?.url ?? null,
    })),
    pagination: {
      limit: query.limit,
      hasMore,
      nextCursor: hasMore ? (auctions.at(-1)?.id ?? null) : null,
    },
  };
};
