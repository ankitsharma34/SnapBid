import { describe, expect, it } from "vitest";

import { createAuctionSchema } from "../src/schemas/auction/create-auction.schema.js";
import { loginSchema } from "../src/schemas/auth/login.schema.js";
import { registerSchema } from "../src/schemas/auth/register.schema.js";
import { bidSchema } from "../src/schemas/bid/bid.schema.js";

const validRegistration = {
  username: "snapbidder",
  email: "BIDDER@EXAMPLE.COM",
  displayName: "Snap Bidder",
  password: "Secure1!",
  confirmPassword: "Secure1!",
};

const validAuction = {
  title: "Vintage Camera",
  startingPrice: 100,
  bidIncrement: 10,
  startTime: new Date("2026-12-01T10:00:00.000Z"),
  endTime: new Date("2026-12-01T11:00:00.000Z"),
};

describe("authentication request schemas", () => {
  it("accepts and normalizes valid registration and login payloads", () => {
    expect(registerSchema.parse(validRegistration)).toEqual({
      username: "snapbidder",
      email: "bidder@example.com",
      displayName: "Snap Bidder",
      password: "Secure1!",
    });
    expect(
      loginSchema.parse({ email: "BIDDER@EXAMPLE.COM", password: "password" }),
    ).toEqual({ email: "bidder@example.com", password: "password" });
  });

  it("rejects missing fields and invalid registration formats", () => {
    expect(
      registerSchema.safeParse({ ...validRegistration, email: undefined })
        .success,
    ).toBe(false);
    expect(
      registerSchema.safeParse({ ...validRegistration, email: "not-an-email" })
        .success,
    ).toBe(false);
    expect(
      registerSchema.safeParse({
        ...validRegistration,
        password: "short",
        confirmPassword: "short",
      }).success,
    ).toBe(false);
    expect(
      registerSchema.safeParse({
        ...validRegistration,
        confirmPassword: "Different1!",
      }).success,
    ).toBe(false);
  });

  it("enforces registration length limits and login types", () => {
    expect(
      registerSchema.safeParse({ ...validRegistration, username: "ab" })
        .success,
    ).toBe(false);
    expect(
      registerSchema.safeParse({
        ...validRegistration,
        username: "a".repeat(21),
      }).success,
    ).toBe(false);
    expect(
      loginSchema.safeParse({ email: 123, password: "password" }).success,
    ).toBe(false);
    expect(loginSchema.safeParse({ email: "bidder@example.com" }).success).toBe(
      false,
    );
  });
});

describe("auction request schema", () => {
  it("accepts a valid auction and defaults images", () => {
    expect(createAuctionSchema.parse(validAuction)).toMatchObject({
      ...validAuction,
      auctionImages: [],
    });
  });

  it("rejects missing fields, invalid types, and invalid time ranges", () => {
    expect(
      createAuctionSchema.safeParse({ ...validAuction, title: undefined })
        .success,
    ).toBe(false);
    expect(
      createAuctionSchema.safeParse({
        ...validAuction,
        startTime: "not-a-date",
      }).success,
    ).toBe(false);
    expect(
      createAuctionSchema.safeParse({
        ...validAuction,
        endTime: validAuction.startTime,
      }).success,
    ).toBe(false);
  });

  it("enforces auction length, monetary, and image limits", () => {
    expect(
      createAuctionSchema.safeParse({ ...validAuction, title: "ab" }).success,
    ).toBe(false);
    expect(
      createAuctionSchema.safeParse({ ...validAuction, title: "a".repeat(201) })
        .success,
    ).toBe(false);
    expect(
      createAuctionSchema.safeParse({ ...validAuction, startingPrice: 0 })
        .success,
    ).toBe(false);
    expect(
      createAuctionSchema.safeParse({ ...validAuction, bidIncrement: -1 })
        .success,
    ).toBe(false);
    expect(
      createAuctionSchema.safeParse({
        ...validAuction,
        auctionImages: Array(11).fill("https://example.com/image.jpg"),
      }).success,
    ).toBe(false);
  });
});

describe("bid request schema", () => {
  it("accepts a valid decimal bid amount", () => {
    expect(bidSchema.parse({ amount: "123.45" })).toEqual({ amount: "123.45" });
  });

  it("rejects missing, non-string, non-positive, and malformed bid amounts", () => {
    expect(bidSchema.safeParse({}).success).toBe(false);
    expect(bidSchema.safeParse({ amount: 123 }).success).toBe(false);
    expect(bidSchema.safeParse({ amount: "0" }).success).toBe(false);
    expect(bidSchema.safeParse({ amount: "12.345" }).success).toBe(false);
  });
});

describe("unknown request fields", () => {
  it.each([
    [registerSchema, validRegistration],
    [loginSchema, { email: "bidder@example.com", password: "password" }],
    [createAuctionSchema, validAuction],
    [bidSchema, { amount: "100" }],
  ])("strips unknown fields for %o", (schema, payload) => {
    const result = schema.parse({ ...payload, unexpected: "removed" });

    expect(result).not.toHaveProperty("unexpected");
  });
});
