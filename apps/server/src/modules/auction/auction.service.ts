import {
  removeAuctionLifecycleJobs,
  replaceAuctionLifecycleJobs,
  scheduleAuctionEnd,
  scheduleAuctionStart,
} from "../../jobs/auction.jobs.js";
import { publishSocketEvent } from "../../redis/redis.pubsub.js";
import { AppError } from "../../utils/app-error.js";
import { toAuctionResponse, toAuctionsListResponse } from "./auction.mapper.js";
import {
  createAuction,
  cancelScheduledAuction,
  findAuctions,
  findAuctionById,
  findCategoryIdBySlug,
  updateAuction,
} from "./auction.repository.js";
import { AuctionListQuery, CreateAuctionInput } from "@snapbid/shared";

export const getAuctionsService = async (query: AuctionListQuery) => {
  const result = await findAuctions(query);

  return {
    auctions: toAuctionsListResponse(result.auctions),
    pagination: {
      page: query.page,
      limit: query.limit,
      total: result.total,
      totalPages: Math.ceil(result.total / query.limit),
      hasNextPage: query.page * query.limit < result.total,
      hasPreviousPage: query.page > 1,
    },
  };
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

  if (status === "LIVE") {
    await publishSocketEvent(
      JSON.stringify({
        event: "auction:started",
        payload: {
          auctionId: createdAuction.id,
          status: "LIVE",
          startedAt: now.toISOString(),
        },
      }),
    );
  }

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
    throw new AppError("Only scheduled auctions can be edited", 409);
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

  const updateResult = await updateAuction({
    auctionId,
    sellerId,
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

  if (updateResult.outcome === "NOT_FOUND") {
    throw new AppError("Auction not found", 404);
  }

  if (updateResult.outcome === "NOT_OWNER") {
    throw new AppError("You can't edit this auction", 403);
  }

  if (updateResult.outcome === "INVALID_STATUS") {
    throw new AppError("Only scheduled auctions can be edited", 409);
  }

  await replaceAuctionLifecycleJobs({
    auctionId,
    startTime: inputData.startTime,
    endTime: inputData.endTime,
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
    throw new AppError("Only scheduled auctions can be cancelled", 409);
  }

  const cancelResult = await cancelScheduledAuction({ auctionId, sellerId });

  if (cancelResult.outcome === "NOT_FOUND") {
    throw new AppError("Auction not found", 404);
  }

  if (cancelResult.outcome === "NOT_OWNER") {
    throw new AppError("You can't cancel this auction", 403);
  }

  if (cancelResult.outcome === "INVALID_STATUS") {
    throw new AppError("Only scheduled auctions can be cancelled", 409);
  }

  await removeAuctionLifecycleJobs(auctionId);
};
