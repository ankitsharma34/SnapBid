import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";
import { env } from "../config/env.js";
import { AppError } from "./app-error.js";
import z from "zod";
import type { Role } from "@snapbid/database";

type AccessTokenPayload = {
  userId: string;
  role: Role;
};

type RefreshTokenPayload = {
  userId: string;
};

export const generateAccessToken = (payload: AccessTokenPayload) => {
  const accessToken = jwt.sign(payload, env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });
  return accessToken;
};

export const generateRefreshToken = (payload: RefreshTokenPayload) => {
  const refreshToken = jwt.sign(payload, env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
    jwtid: randomUUID(),
  });
  return refreshToken;
};

const accessTokenPayloadSchema = z.object({
  userId: z.string(),
  role: z.enum(["USER", "ADMIN"]),
});

const refreshTokenPayloadSchema = z.object({
  userId: z.string().min(1),
});

export const verifyAccessToken = (token: string) => {
  try {
    const payload = jwt.verify(token, env.ACCESS_TOKEN_SECRET);

    return accessTokenPayloadSchema.parse(payload);
  } catch {
    throw new AppError("Invalid or expired access token", 401);
  }
};

export const verifyRefreshToken = (token: string) => {
  try {
    const payload = jwt.verify(token, env.REFRESH_TOKEN_SECRET);
    return refreshTokenPayloadSchema.parse(payload);
  } catch {
    throw new AppError(
      "Invalid or expired refresh token",
      401,
      "INVALID_REFRESH_TOKEN",
    );
  }
};
