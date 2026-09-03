import { prisma } from "../../prisma/prisma.js";

export const findAuctionForLifecycle = async (auctionId: string) => {
  return prisma.auction.findUnique({
    where: { id: auctionId },
    select: {
      id: true,
      status: true,
      startTime: true,
      endTime: true,
    },
  });
};

export const markAuctionAsLive = async (auctionId: string, now: Date) => {
  const result = await prisma.auction.updateMany({
    where: {
      id: auctionId,
      status: "SCHEDULED",
      startTime: {
        lte: now,
      },
      endTime: {
        gt: now,
      },
    },
    data: {
      status: "LIVE",
    },
  });

  return result.count === 1;
};

export const finalizeAuction = async (auctionId: string, now: Date) => {
  return prisma.$transaction(async (tx) => {
    const highestBid = await tx.bid.findFirst({
      where: {
        auctionId,
      },
      orderBy: [{ amount: "desc" }, { createdAt: "asc" }],
    });

    await tx.auction.updateMany({
      where: {
        id: auctionId,
        status: "LIVE",
        endTime: {
          lte: now,
        },
      },
      data: {
        status: "ENDED",
        winnerId: highestBid?.bidderId ?? null,
        winningBidId: highestBid?.id ?? null,
      },
    });
  });
};
