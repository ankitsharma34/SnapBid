import { beforeEach, describe, expect, it, vi } from "vitest";

const repository = vi.hoisted(() => ({
  findAuctionForLifecycle: vi.fn(),
  markAuctionAsLive: vi.fn(),
  finalizeAuction: vi.fn(),
}));

vi.mock(
  "../../src/repositories/auction-lifecycle.repository.js",
  () => repository,
);

import {
  endAuctionService,
  startAuctionService,
} from "../../src/services/auction-lifecycle.service.js";

const now = new Date("2026-11-03T10:00:00.000Z");
const auction = ({
  status = "SCHEDULED",
  startTime = new Date("2026-11-03T09:00:00.000Z"),
  endTime = new Date("2026-11-03T11:00:00.000Z"),
}: {
  status?: string;
  startTime?: Date;
  endTime?: Date;
} = {}) => ({
  id: "auction-1",
  status,
  startTime,
  endTime,
});

describe("auction lifecycle timing and status validation", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
    vi.resetAllMocks();
    repository.markAuctionAsLive.mockResolvedValue(true);
    repository.finalizeAuction.mockResolvedValue({
      ended: true,
      status: "ENDED",
      winner: null,
    });
  });

  it("allows the scheduled → live → ended lifecycle at valid times", async () => {
    repository.findAuctionForLifecycle.mockResolvedValueOnce(auction());

    await expect(startAuctionService("auction-1")).resolves.toMatchObject({
      started: true,
    });
    expect(repository.markAuctionAsLive).toHaveBeenCalledWith("auction-1", now);

    repository.findAuctionForLifecycle.mockResolvedValueOnce(
      auction({
        status: "LIVE",
        endTime: new Date("2026-11-03T09:59:59.999Z"),
      }),
    );

    await expect(endAuctionService("auction-1")).resolves.toMatchObject({
      ended: true,
    });
    expect(repository.finalizeAuction).toHaveBeenCalledWith("auction-1", now);
  });

  it("rejects a scheduled auction whose start time is still in the future", async () => {
    repository.findAuctionForLifecycle.mockResolvedValue(
      auction({ startTime: new Date("2026-11-03T10:00:00.001Z") }),
    );

    await expect(startAuctionService("auction-1")).rejects.toMatchObject({
      code: "AUCTION_NOT_STARTED",
    });
  });

  it("allows starting exactly at the start time", async () => {
    repository.findAuctionForLifecycle.mockResolvedValue(
      auction({ startTime: now }),
    );

    await expect(startAuctionService("auction-1")).resolves.toMatchObject({
      started: true,
    });
  });

  it("rejects starting at or after the end time", async () => {
    repository.findAuctionForLifecycle.mockResolvedValue(
      auction({ endTime: now }),
    );

    await expect(startAuctionService("auction-1")).rejects.toMatchObject({
      code: "AUCTION_ALREADY_ENDED",
    });
  });

  it("allows ending exactly at the end time", async () => {
    repository.findAuctionForLifecycle.mockResolvedValue(
      auction({ status: "LIVE", endTime: now }),
    );

    await expect(endAuctionService("auction-1")).resolves.toMatchObject({
      ended: true,
    });
  });

  it("rejects ending before the end time", async () => {
    repository.findAuctionForLifecycle.mockResolvedValue(
      auction({ status: "LIVE" }),
    );

    await expect(endAuctionService("auction-1")).rejects.toMatchObject({
      code: "INVALID_AUCTION_TIME",
    });
  });

  it.each(["DRAFT", "ENDED", "CANCELLED"])(
    "does not allow %s to transition to live",
    async (status) => {
      repository.findAuctionForLifecycle.mockResolvedValue(auction({ status }));

      await expect(startAuctionService("auction-1")).rejects.toMatchObject({
        code: "INVALID_AUCTION_STATE",
      });
      expect(repository.markAuctionAsLive).not.toHaveBeenCalled();
    },
  );

  it.each(["DRAFT", "SCHEDULED", "CANCELLED"])(
    "does not allow %s to transition to ended",
    async (status) => {
      repository.findAuctionForLifecycle.mockResolvedValue(auction({ status }));

      await expect(endAuctionService("auction-1")).rejects.toMatchObject({
        code: "INVALID_AUCTION_STATE",
      });
      expect(repository.finalizeAuction).not.toHaveBeenCalled();
    },
  );
});
