import type { loginDto, registerDto } from "@snapbid/shared";
import { Request, Response } from "express";
import { getValidatedBody } from "../../middlewares/validate-request.js";
import {
  loginUserService,
  logoutUserService,
  refreshAccessTokenService,
  registerUserService,
  saveRefreshTokenService,
} from "./auth.service.js";
import { refreshTokenMaxAge } from "./auth.constant.js";
import { generateAccessToken, generateRefreshToken } from "../../utils/jwt.js";
import { env } from "../../config/env.js";
import { AppError } from "../../utils/app-error.js";

const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite:
    env.NODE_ENV === "production" ? ("none" as const) : ("lax" as const),
  path: "/api/auth",
};

const getCookie = (req: Request, name: string) => {
  const cookieHeader = req.headers.cookie;

  if (!cookieHeader) {
    return null;
  }

  for (const part of cookieHeader.split(";")) {
    const separator = part.indexOf("=");

    if (separator < 0) continue;

    const cookieName = part.slice(0, separator).trim();
    if (cookieName !== name) continue;

    try {
      return decodeURIComponent(part.slice(separator + 1).trim());
    } catch {
      return null;
    }
  }

  return null;
};

const setRefreshTokenCookie = (res: Response, refreshToken: string) => {
  res.cookie("refresh_token", refreshToken, {
    ...cookieOptions,
    maxAge: refreshTokenMaxAge,
  });
};

export const postRegisterHandler = async (req: Request, res: Response) => {
  const input = getValidatedBody<registerDto>(req);
  const user = await registerUserService(input);

  // 2. Generate access and refresh tokens
  const accessToken = generateAccessToken({
    userId: user.id,
    role: user.role,
  });
  const refreshToken = generateRefreshToken({
    userId: user.id,
  });

  // 3. Save the refresh token in the database
  await saveRefreshTokenService(user.id, refreshToken);

  // 4. Set the refresh token in an HTTP-only cookie
  setRefreshTokenCookie(res, refreshToken);

  // 5. Send the response with user data and access token
  res.status(201).json({
    success: true,
    message: "User registered successfully",
    user,
    accessToken,
  });
};

export const postLoginHandler = async (req: Request, res: Response) => {
  const input = getValidatedBody<loginDto>(req);
  const user = await loginUserService(input);

  // 2. Generate access and refresh tokens
  const accessToken = generateAccessToken({
    userId: user.id,
    role: user.role,
  });
  const refreshToken = generateRefreshToken({
    userId: user.id,
  });

  // 3. Save the refresh token in the database
  await saveRefreshTokenService(user.id, refreshToken);

  // 4. Set the refresh token in an HTTP-only cookie
  setRefreshTokenCookie(res, refreshToken);

  return res.status(200).json({
    success: true,
    message: "User logged in successfully",
    user,
    accessToken,
  });
};

export const postRefreshHandler = async (req: Request, res: Response) => {
  const refreshToken = getCookie(req, "refresh_token");

  if (!refreshToken) {
    throw new AppError(
      "Refresh token is required",
      401,
      "REFRESH_TOKEN_REQUIRED",
    );
  }

  const tokens = await refreshAccessTokenService(refreshToken);
  setRefreshTokenCookie(res, tokens.refreshToken);

  return res.status(200).json({
    success: true,
    message: "Access token refreshed successfully",
    accessToken: tokens.accessToken,
  });
};

export const postLogoutHandler = async (req: Request, res: Response) => {
  const refreshToken = getCookie(req, "refresh_token");

  await logoutUserService(refreshToken);
  res.clearCookie("refresh_token", cookieOptions);

  return res.status(200).json({
    success: true,
    message: "User logged out successfully",
  });
};
