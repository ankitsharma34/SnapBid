import { AppError } from "../../utils/app-error.js";
import { toAuctionResponse, toAuctionsListResponse } from "./auction.mapper.js";
import {
  createAuction,
  findAllAuctions,
  findAuctionById,
  findCategoryIdBySlug,
} from "./auction.repository.js";
import { CreateAuctionInput } from "@snapbid/shared";

export const getAuctionsService = async () => {
  const auctions = await findAllAuctions();
  return toAuctionsListResponse(auctions);
};

export const getAuctionByIdService = async (id: string) => {
  const auction = await findAuctionById(id);
  if (!auction) {
    throw new AppError("Auction not found", 404);
  }
  return toAuctionResponse(auction);
};

export const createAuctionService = async ({
  inputData,
  sellerId,
}: {
  inputData: CreateAuctionInput;
  sellerId: string;
}) => {
  const now = new Date();

  if (inputData.endTime <= now) {
    throw new AppError("Auction end time must be in the future", 400);
  }

  const categoryId = inputData.categorySlug
    ? await findCategoryIdBySlug(inputData.categorySlug)
    : null;

  if (inputData.categorySlug && !categoryId) {
    throw new AppError("Category not found", 404);
  }

  const status: "SCHEDULED" | "LIVE" =
    inputData.startTime > now ? "SCHEDULED" : "LIVE";

  const newAuctionInput = {
    ...inputData,
    description: inputData.description ?? null,
    currentPrice: inputData.startingPrice,
    categoryId,
    sellerId,
    status,
  };

  const createdAuction = await createAuction(newAuctionInput);
  return createdAuction.id;
};
