import { prisma } from "../../prisma/prisma.js";

export const findAllAuctions = async () => {
  return prisma.auction.findMany({
    select: {
      id: true,
      title: true,
      currentPrice: true,
      bidIncrement: true,
      startTime: true,
      endTime: true,
      status: true,

      auctionImages: {
        select: {
          url: true,
        },
        orderBy: {
          position: "asc",
        },
        take: 1,
      },
    },
  });
};

export type AuctionListQueryResult = Awaited<
  ReturnType<typeof findAllAuctions>
>;

export const findAuctionById = async (id: string) => {
  return prisma.auction.findUnique({
    where: { id },

    select: {
      id: true,
      title: true,
      description: true,
      startingPrice: true,
      currentPrice: true,
      bidIncrement: true,
      startTime: true,
      endTime: true,
      status: true,

      auctionImages: {
        select: {
          url: true,
          position: true,
        },
        orderBy: {
          position: "asc",
        },
      },

      category: {
        select: {
          name: true,
          slug: true,
        },
      },

      seller: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
        },
      },
    },
  });
};

export type AuctionQueryResult = NonNullable<
  Awaited<ReturnType<typeof findAuctionById>>
>;
