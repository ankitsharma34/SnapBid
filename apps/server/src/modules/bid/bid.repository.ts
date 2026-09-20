import { Prisma } from "@snapbid/database";
import { prisma } from "@snapbid/database";
import { AppError } from "../../utils/app-error.js";

export const placeBid = async ({
  auctionId,
  bidderId,
  inputAmount,
}: {
  auctionId: string;
  bidderId: string;
  inputAmount: string;
}) => {
  return prisma.$transaction(
    async (tx) => {
      const auctions = await tx.$queryRaw<
        {
          id: string;
          currentPrice: Prisma.Decimal;
          bidIncrement: Prisma.Decimal;
          startTime: Date;
          endTime: Date;
          status: string;
          sellerId: string;
        }[]
      >`
        SELECT
          "id",
          "currentPrice",
          "bidIncrement",
          "startTime",
          "endTime",
          "status",
          "sellerId"
        FROM "Auction"
        WHERE "id" = ${auctionId}
        FOR UPDATE
      `;

      const auction = auctions[0];

      if (!auction) {
        throw new AppError("Auction not found", 404);
      }

      const now = new Date();

      if (auction.status !== "LIVE") {
        throw new AppError("Auction is not live", 409);
      }

      if (auction.startTime > now || auction.endTime <= now) {
        throw new AppError("Auction is not live", 409);
      }

      if (auction.sellerId === bidderId) {
        throw new AppError("Seller cannot bid on their own auction", 403);
      }

      const minimumBid = auction.currentPrice.add(auction.bidIncrement);

      const amount = new Prisma.Decimal(inputAmount);

      if (amount.lt(minimumBid)) {
        throw new AppError(
          `Bid must be at least ${minimumBid.toString()}`,
          400,
        );
      }

      const bid = await tx.bid.create({
        data: {
          auctionId,
          bidderId,
          amount,
        },
      });

      await tx.auction.update({
        where: {
          id: auctionId,
        },
        data: {
          currentPrice: amount,
        },
      });

      return { bid, currentPrice: amount };
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
    },
  );
};

export const findBidHistoryByAuctionId = (auctionId: string) => {
  return prisma.bid.findMany({
    where: {
      auctionId,
    },
    select: {
      id: true,
      amount: true,
      createdAt: true,
      bidder: {
        select: {
          id: true,
          username: true,
          displayName: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};
