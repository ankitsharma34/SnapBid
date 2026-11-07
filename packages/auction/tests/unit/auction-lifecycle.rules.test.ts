import { describe, expect, it } from "vitest";

import {
  endAuctionValidationError,
  startAuctionValidationError,
} from "../../src/services/auction-lifecycle.rules.js";

const now = new Date("2026-11-07T10:00:00.000Z");
const auction = ({
  status = "SCHEDULED",
  startTime = new Date("2026-11-07T09:00:00.000Z"),
  endTime = new Date("2026-11-07T11:00:00.000Z"),
}: {
  status?: string;
  startTime?: Date;
  endTime?: Date;
} = {}) => ({ status, startTime, endTime });

describe("auction lifecycle validation rules", () => {
  it("allows a scheduled auction within its bidding window to start", () => {
    expect(startAuctionValidationError(auction(), now)).toBeNull();
  });

  it("normalizes start eligibility at exact time boundaries", () => {
    expect(
      startAuctionValidationError(auction({ startTime: now }), now),
    ).toBeNull();
    expect(
      startAuctionValidationError(
        auction({ startTime: new Date("2026-11-07T10:00:00.001Z") }),
        now,
      ),
    ).toBe("AUCTION_NOT_STARTED");
    expect(startAuctionValidationError(auction({ endTime: now }), now)).toBe(
      "AUCTION_ALREADY_ENDED",
    );
  });

  it.each(["DRAFT", "LIVE", "ENDED", "CANCELLED"])(
    "rejects %s from starting directly",
    (status) => {
      expect(startAuctionValidationError(auction({ status }), now)).toBe(
        "INVALID_AUCTION_STATE",
      );
    },
  );

  it("allows a live auction to end at its end time", () => {
    expect(
      endAuctionValidationError(auction({ status: "LIVE", endTime: now }), now),
    ).toBeNull();
  });

  it("rejects ending a live auction before its end time", () => {
    expect(endAuctionValidationError(auction({ status: "LIVE" }), now)).toBe(
      "INVALID_AUCTION_TIME",
    );
  });

  it.each(["DRAFT", "SCHEDULED", "ENDED", "CANCELLED"])(
    "rejects %s from ending",
    (status) => {
      expect(endAuctionValidationError(auction({ status }), now)).toBe(
        "INVALID_AUCTION_STATE",
      );
    },
  );
});
