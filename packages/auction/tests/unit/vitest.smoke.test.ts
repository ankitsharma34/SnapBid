import { describe, expect, it } from "vitest";

import { AuctionError } from "../../src/errors/auction-error.js";

describe("auction package test setup", () => {
  it("loads TypeScript modules through ESM imports", () => {
    const error = new AuctionError("Auction not found", "AUCTION_NOT_FOUND");

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("AuctionError");
    expect(error.code).toBe("AUCTION_NOT_FOUND");
  });
});
