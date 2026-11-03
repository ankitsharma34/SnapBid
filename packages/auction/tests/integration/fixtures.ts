import { randomUUID } from "node:crypto";

import {
  AuctionStatus,
  prisma,
  type Auction,
  type Bid,
  type User,
} from "@snapbid/database";

const fixtureUserIds = new Set<string>();

export const createUserFixture = async (
  input: Partial<Pick<User, "email" | "username" | "displayName">> = {},
) => {
  const suffix = randomUUID();
  const user = await prisma.user.create({
    data: {
      email: input.email ?? `test-${suffix}@example.test`,
      username: input.username ?? `test-${suffix}`,
      displayName: input.displayName ?? "Test User",
      password: "not-a-real-password",
    },
  });

  fixtureUserIds.add(user.id);
  return user;
};

export const createAuctionFixture = async ({
  sellerId,
  status = AuctionStatus.LIVE,
  ...input
}: {
  sellerId: string;
  status?: AuctionStatus;
  title?: string;
  startingPrice?: string;
  currentPrice?: string;
  bidIncrement?: string;
  startTime?: Date;
  endTime?: Date;
}) => {
  const now = new Date();

  return prisma.auction.create({
    data: {
      sellerId,
      status,
      title: input.title ?? `Test auction ${randomUUID()}`,
      startingPrice: input.startingPrice ?? "100",
      currentPrice: input.currentPrice ?? "100",
      bidIncrement: input.bidIncrement ?? "10",
      startTime: input.startTime ?? new Date(now.getTime() - 60_000),
      endTime: input.endTime ?? new Date(now.getTime() + 3_600_000),
    },
  });
};

export const createBidFixture = async ({
  auctionId,
  bidderId,
  amount = "110",
}: {
  auctionId: string;
  bidderId: string;
  amount?: string;
}) => {
  return prisma.bid.create({
    data: { auctionId, bidderId, amount },
  });
};

export const cleanupTestData = async () => {
  const userIds = [...fixtureUserIds];

  if (userIds.length === 0) return;

  const auctions = await prisma.auction.findMany({
    where: {
      sellerId: {
        in: userIds,
      },
    },
    select: {
      id: true,
    },
  });

  const auctionIds = auctions.map((auction) => auction.id);

  await prisma.bid.deleteMany({
    where: {
      OR: [
        {
          bidderId: {
            in: userIds,
          },
        },
        {
          auctionId: {
            in: auctionIds,
          },
        },
      ],
    },
  });

  await prisma.auction.deleteMany({
    where: {
      id: {
        in: auctionIds,
      },
    },
  });

  await prisma.user.deleteMany({
    where: {
      id: {
        in: userIds,
      },
    },
  });

  fixtureUserIds.clear();
};

export type { Auction, Bid, User };
