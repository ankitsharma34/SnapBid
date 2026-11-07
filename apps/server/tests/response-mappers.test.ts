import { describe, expect, it } from "vitest";

import {
  toAuctionResponse,
  toAuctionsListResponse,
} from "../src/modules/auction/auction.mapper.js";
import { toBidResponse } from "../src/modules/bid/bid.mapper.js";

const decimal = (value: string) => ({ toString: () => value });

describe("auction response mappers", () => {
  it("maps an auction to a public response with string prices and ISO timestamps", () => {
    const response = toAuctionResponse({
      id: "auction-1",
      title: "Vintage Camera",
      description: null,
      startingPrice: decimal("99.99"),
      currentPrice: decimal("109.99"),
      bidIncrement: decimal("5.00"),
      startTime: new Date("2026-11-07T10:00:00.000Z"),
      endTime: new Date("2026-11-07T11:00:00.000Z"),
      status: "LIVE",
      auctionImages: [],
      category: null,
      seller: {
        id: "seller-1",
        username: "seller",
        displayName: "Seller",
        avatarUrl: null,
        email: "private@example.com",
        password: "password-hash",
      },
    } as never);

    expect(response).toEqual({
      id: "auction-1",
      title: "Vintage Camera",
      description: null,
      startingPrice: "99.99",
      currentPrice: "109.99",
      bidIncrement: "5.00",
      startTime: "2026-11-07T10:00:00.000Z",
      endTime: "2026-11-07T11:00:00.000Z",
      status: "LIVE",
      images: [],
      category: null,
      seller: {
        id: "seller-1",
        username: "seller",
        displayName: "Seller",
        avatarUrl: null,
      },
    });
    expect(response.seller).not.toHaveProperty("email");
    expect(response.seller).not.toHaveProperty("password");
  });

  it("maps auction summaries with nullable category and thumbnail values", () => {
    const response = toAuctionsListResponse([
      {
        id: "auction-1",
        title: "Vintage Camera",
        currentPrice: decimal("109.99"),
        bidIncrement: decimal("5"),
        startTime: new Date("2026-11-07T10:00:00.000Z"),
        endTime: new Date("2026-11-07T11:00:00.000Z"),
        status: "LIVE",
        category: null,
        auctionImages: [],
        sellerId: "internal-seller-id",
      },
    ] as never);

    expect(response).toEqual([
      {
        id: "auction-1",
        title: "Vintage Camera",
        currentPrice: "109.99",
        bidIncrement: "5",
        startTime: "2026-11-07T10:00:00.000Z",
        endTime: "2026-11-07T11:00:00.000Z",
        status: "LIVE",
        category: null,
        thumbnailUrl: null,
      },
    ]);
    expect(response[0]).not.toHaveProperty("sellerId");
  });
});

describe("bid response mapper", () => {
  it("maps a bid into a public DTO without internal fields", () => {
    const bid = {
      id: "bid-1",
      bidderId: "bidder-1",
      amount: decimal("110.50"),
      createdAt: new Date("2026-11-07T10:30:00.000Z"),
      auctionId: "auction-1",
      updatedAt: new Date("2026-11-07T10:30:01.000Z"),
    };
    const response = toBidResponse(bid);

    expect(response).toEqual({
      bidId: "bid-1",
      bidderId: "bidder-1",
      amount: "110.50",
      createdAt: "2026-11-07T10:30:00.000Z",
    });
    expect(response).not.toHaveProperty("auctionId");
    expect(response).not.toHaveProperty("updatedAt");
  });
});
