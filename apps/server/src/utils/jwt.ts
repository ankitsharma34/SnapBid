import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { AppError } from "./app-error.js";
import z from "zod";

type AccessTokenPayload = {
  userId: string;
  role: string;
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
  });
  return refreshToken;
};

const accessTokenPayloadSchema = z.object({
  userId: z.string(),
  role: z.enum(["USER", "ADMIN"]),
});

export const verifyAccessToken = (token: string) => {
  try {
    const payload = jwt.verify(token, env.ACCESS_TOKEN_SECRET);

    return accessTokenPayloadSchema.parse(payload);
  } catch {
    throw new AppError("Invalid or expired access token", 401);
  }
};
