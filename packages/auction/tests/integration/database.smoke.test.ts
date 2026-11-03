import { describe, expect, it } from "vitest";

import { prisma } from "@snapbid/database";
import {
  createAuctionFixture,
  createBidFixture,
  createUserFixture,
} from "./fixtures.js";

describe("integration test database", () => {
  it("creates auction data with the reusable fixtures", async () => {
    const seller = await createUserFixture();
    const bidder = await createUserFixture();
    const auction = await createAuctionFixture({ sellerId: seller.id });
    const bid = await createBidFixture({
      auctionId: auction.id,
      bidderId: bidder.id,
    });

    const result = await prisma.$queryRaw<Array<{ value: number }>>`
      SELECT 1 AS value
    `;

    expect(result).toEqual([{ value: 1 }]);
    expect(bid.auctionId).toBe(auction.id);
    expect(bid.bidderId).toBe(bidder.id);
  });
});
