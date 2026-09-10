import {
  scheduleAuctionEnd,
  scheduleAuctionStart,
} from "../../jobs/auction.jobs.js";
import { AppError } from "../../utils/app-error.js";
import { toAuctionResponse, toAuctionsListResponse } from "./auction.mapper.js";
import {
  createAuction,
  findAllAuctions,
  findAuctionById,
  findCategoryIdBySlug,
  updateAuction,
  updateAuctionStatus,
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

  // BullMQ service
  if (status === "SCHEDULED") {
    await scheduleAuctionStart({
      auctionId: createdAuction.id,
      startTime: createdAuction.startTime,
    });
  }

  await scheduleAuctionEnd({
    auctionId: createdAuction.id,
    endTime: createdAuction.endTime,
  });

  return createdAuction.id;
};

export const editAuctionService = async ({
  auctionId,
  sellerId,
  inputData,
}: {
  auctionId: string;
  sellerId: string;
  inputData: CreateAuctionInput;
}) => {
  const auction = await findAuctionById(auctionId);

  if (!auction) {
    throw new AppError("Auction not found", 404);
  }

  // Authorization
  if (auction.seller.id !== sellerId) {
    throw new AppError("You can't edit this auction", 403);
  }

  // Only scheduled auctions can be edited
  if (auction.status !== "SCHEDULED") {
    throw new AppError("Only scheduled auctions can be edited", 403);
  }

  const now = new Date();

  // Auction must remain in the future
  if (inputData.startTime <= now) {
    throw new AppError("Auction start time must be in the future", 400);
  }

  if (inputData.endTime <= inputData.startTime) {
    throw new AppError("End time must be after start time", 400);
  }

  let categoryId = auction.category?.id || null;

  if (inputData.categorySlug !== undefined) {
    const category = await findCategoryIdBySlug(inputData.categorySlug);

    if (!category) {
      throw new AppError("Category not found", 404);
    }

    categoryId = category;
  }

  await updateAuction({
    auctionId,
    input: {
      title: inputData.title,
      description: inputData.description ?? null,
      startingPrice: inputData.startingPrice,
      bidIncrement: inputData.bidIncrement,
      startTime: inputData.startTime,
      currentPrice: inputData.startingPrice,
      endTime: inputData.endTime,
      categoryId,
      auctionImages: inputData.auctionImages,
    },
  });
};

export const cancelAuctionService = async ({
  auctionId,
  sellerId,
}: {
  auctionId: string;
  sellerId: string;
}) => {
  const auction = await findAuctionById(auctionId);

  if (!auction) {
    throw new AppError("Auction not found", 404);
  }

  if (auction.seller.id !== sellerId) {
    throw new AppError("You can't cancel this auction", 403);
  }

  if (auction.status !== "SCHEDULED") {
    throw new AppError("Only scheduled auctions can be cancelled", 403);
  }

  await updateAuctionStatus(auctionId, "CANCELLED");
};
