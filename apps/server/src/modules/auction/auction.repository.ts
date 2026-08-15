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
