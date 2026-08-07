import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

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
