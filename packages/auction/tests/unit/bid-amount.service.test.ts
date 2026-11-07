import { describe, expect, it } from "vitest";

import {
  calculateMinimumBid,
  meetsMinimumBid,
} from "../../src/services/bid-amount.service.js";

describe("bid amount rules", () => {
  it("calculates the minimum acceptable bid", () => {
    expect(calculateMinimumBid("100", "10")).toBe("110");
  });

  it("rejects a bid equal to the current price", () => {
    const minimumBid = calculateMinimumBid("100", "10");

    expect(meetsMinimumBid("100", minimumBid)).toBe(false);
  });

  it("rejects a bid below the required increment", () => {
    const minimumBid = calculateMinimumBid("100", "10");

    expect(meetsMinimumBid("109.99", minimumBid)).toBe(false);
  });

  it("accepts a bid exactly at the minimum", () => {
    const minimumBid = calculateMinimumBid("100", "10");

    expect(meetsMinimumBid("110", minimumBid)).toBe(true);
  });

  it("accepts a bid above the minimum", () => {
    const minimumBid = calculateMinimumBid("100", "10");

    expect(meetsMinimumBid("125", minimumBid)).toBe(true);
  });

  it("uses the starting price as the current price before the first bid", () => {
    const minimumBid = calculateMinimumBid("49.99", "5");

    expect(minimumBid).toBe("54.99");
    expect(meetsMinimumBid("54.99", minimumBid)).toBe(true);
  });

  it("handles decimal money with exact integer minor-unit arithmetic", () => {
    const minimumBid = calculateMinimumBid("0.1", "0.2");

    expect(minimumBid).toBe("0.3");
    expect(meetsMinimumBid("0.3", minimumBid)).toBe(true);
    expect(meetsMinimumBid("0.29", minimumBid)).toBe(false);
  });

  it("normalizes trailing decimal zeros in calculated prices", () => {
    expect(calculateMinimumBid("100.00", "5.00")).toBe("105");
  });
});
