import { beforeEach, describe, expect, it, vi } from "vitest";

const database = vi.hoisted(() => ({
  prisma: {
    $transaction: vi.fn(),
  },
  Prisma: {
    Decimal: class {
      constructor(readonly value: string) {}
    },
    TransactionIsolationLevel: {
      ReadCommitted: "ReadCommitted",
    },
  },
}));

vi.mock("@snapbid/database", () => database);

import { AppError } from "../src/utils/app-error.js";
import { placeBid } from "../src/modules/bid/bid.repository.js";

const transaction = {
  $queryRaw: vi.fn(),
  bid: { create: vi.fn() },
  auction: { update: vi.fn() },
};

const liveAuction = (overrides: Record<string, unknown> = {}) => ({
  id: "auction-1",
  currentPrice: "100",
  bidIncrement: "10",
  startTime: new Date(Date.now() - 60_000),
  endTime: new Date(Date.now() + 60_000),
  status: "LIVE",
  sellerId: "seller-1",
  ...overrides,
});

const expectDomainError = async (
  operation: Promise<unknown>,
  statusCode: number,
  code: string,
) => {
  await expect(operation).rejects.toBeInstanceOf(AppError);
  await expect(operation).rejects.toMatchObject({ statusCode, code });
};

describe("bid domain errors", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    database.prisma.$transaction.mockImplementation(async (callback) =>
      callback(transaction),
    );
    transaction.bid.create.mockResolvedValue({
      id: "bid-1",
      bidderId: "bidder-1",
      amount: "110",
      createdAt: new Date(),
    });
    transaction.auction.update.mockResolvedValue({});
  });

  it.each(["DRAFT", "SCHEDULED"])(
    "rejects invalid auction status %s",
    async (status) => {
      transaction.$queryRaw.mockResolvedValue([liveAuction({ status })]);

      await expectDomainError(
        placeBid({
          auctionId: "auction-1",
          bidderId: "bidder-1",
          inputAmount: "110",
        }),
        409,
        "CONFLICT",
      );
    },
  );

  it("rejects a seller bidding on their own auction", async () => {
    transaction.$queryRaw.mockResolvedValue([liveAuction()]);

    await expectDomainError(
      placeBid({
        auctionId: "auction-1",
        bidderId: "seller-1",
        inputAmount: "110",
      }),
      403,
      "FORBIDDEN",
    );
  });

  it.each(["100", "109.99"])(
    "rejects bid amount %s below the minimum",
    async (inputAmount) => {
      transaction.$queryRaw.mockResolvedValue([liveAuction()]);

      await expectDomainError(
        placeBid({ auctionId: "auction-1", bidderId: "bidder-1", inputAmount }),
        400,
        "BAD_REQUEST",
      );
    },
  );

  it.each(["ENDED", "CANCELLED"])(
    "rejects bidding on a %s auction",
    async (status) => {
      transaction.$queryRaw.mockResolvedValue([liveAuction({ status })]);

      await expectDomainError(
        placeBid({
          auctionId: "auction-1",
          bidderId: "bidder-1",
          inputAmount: "110",
        }),
        409,
        "CONFLICT",
      );
    },
  );

  it("rejects a missing auction", async () => {
    transaction.$queryRaw.mockResolvedValue([]);

    await expectDomainError(
      placeBid({
        auctionId: "missing",
        bidderId: "bidder-1",
        inputAmount: "110",
      }),
      404,
      "NOT_FOUND",
    );
  });
});
