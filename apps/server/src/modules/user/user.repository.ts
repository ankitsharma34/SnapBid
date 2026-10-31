import { prisma } from "@snapbid/database";
import type {
  SellerAuctionHistoryQuery,
  UpdateUserProfileInput,
  UserBidHistoryQuery,
  UserWinsQuery,
} from "@snapbid/shared";

const publicProfileSelect = {
  id: true,
  username: true,
  displayName: true,
  avatarUrl: true,
} as const;

export const findPublicUserProfileById = (userId: string) => {
  return prisma.user.findUnique({
    where: { id: userId },
    select: publicProfileSelect,
  });
};

export const updateUserProfile = (
  userId: string,
  input: UpdateUserProfileInput,
) => {
  return prisma.user.update({
    where: { id: userId },
    data: {
      ...(input.username !== undefined ? { username: input.username } : {}),
      ...(input.displayName !== undefined
        ? { displayName: input.displayName }
        : {}),
      ...(input.avatarUrl !== undefined ? { avatarUrl: input.avatarUrl } : {}),
    },
    select: publicProfileSelect,
  });
};

export const findSellerAuctions = ({
  userId,
  query,
}: {
  userId: string;
  query: SellerAuctionHistoryQuery;
}) => {
  return prisma.auction.findMany({
    where: {
      sellerId: userId,
      ...(query.status !== undefined ? { status: query.status } : {}),
    },
    select: {
      id: true,
      title: true,
      startingPrice: true,
      currentPrice: true,
      bidIncrement: true,
      startTime: true,
      endTime: true,
      status: true,
      createdAt: true,
      auctionImages: {
        select: { url: true },
        orderBy: { position: "asc" },
        take: 1,
      },
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    ...(query.cursor !== undefined
      ? { cursor: { id: query.cursor }, skip: 1 }
      : {}),
    take: query.limit + 1,
  });
};

export const findUserBids = ({
  userId,
  query,
}: {
  userId: string;
  query: UserBidHistoryQuery;
}) => {
  return prisma.bid.findMany({
    where: { bidderId: userId },
    select: {
      id: true,
      amount: true,
      createdAt: true,
      auction: {
        select: {
          id: true,
          title: true,
          status: true,
          currentPrice: true,
          endTime: true,
          auctionImages: {
            select: { url: true },
            orderBy: { position: "asc" },
            take: 1,
          },
        },
      },
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    ...(query.cursor !== undefined
      ? { cursor: { id: query.cursor }, skip: 1 }
      : {}),
    take: query.limit + 1,
  });
};

export const findUserWonAuctions = ({
  userId,
  query,
}: {
  userId: string;
  query: UserWinsQuery;
}) => {
  return prisma.auction.findMany({
    where: {
      winnerId: userId,
      winningBidId: { not: null },
      status: "ENDED",
    },
    select: {
      id: true,
      title: true,
      startTime: true,
      endTime: true,
      status: true,
      winningBid: {
        select: {
          id: true,
          amount: true,
          createdAt: true,
        },
      },
      auctionImages: {
        select: { url: true },
        orderBy: { position: "asc" },
        take: 1,
      },
    },
    orderBy: [{ endTime: "desc" }, { id: "desc" }],
    ...(query.cursor !== undefined
      ? { cursor: { id: query.cursor }, skip: 1 }
      : {}),
    take: query.limit + 1,
  });
};
