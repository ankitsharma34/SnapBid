import { Prisma, prisma } from "@snapbid/database";

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
  return prisma.$transaction(
    async (tx) => {
      // Bid placement locks this same row. Acquiring the lock first guarantees
      // that every bid committed before the deadline is visible before the
      // winner is selected, and blocks new bids while finalization completes.
      const lockedAuctions = await tx.$queryRaw<
        { status: string; endTime: Date }[]
      >`
        SELECT "status", "endTime"
        FROM "Auction"
        WHERE "id" = ${auctionId}
        FOR UPDATE
      `;
      const lockedAuction = lockedAuctions[0];

      if (
        !lockedAuction ||
        lockedAuction.status !== "LIVE" ||
        lockedAuction.endTime > now
      ) {
        return {
          ended: false as const,
          status: lockedAuction?.status ?? null,
          winner: null,
        };
      }

      const highestBid = await tx.bid.findFirst({
        where: {
          auctionId,
        },
        orderBy: [{ amount: "desc" }, { createdAt: "asc" }],
        select: {
          id: true,
          bidderId: true,
          amount: true,
        },
      });

      await tx.auction.update({
        where: {
          id: auctionId,
        },
        data: {
          status: "ENDED",
          winnerId: highestBid?.bidderId ?? null,
          winningBidId: highestBid?.id ?? null,
        },
      });

      return {
        ended: true as const,
        status: "ENDED",
        winner: highestBid
          ? {
              userId: highestBid.bidderId,
              bidId: highestBid.id,
              amount: highestBid.amount,
            }
          : null,
      };
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
    },
  );
};
