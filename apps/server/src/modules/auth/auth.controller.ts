import { loginSchema, registerSchema } from "@snapbid/shared";
import { Request, Response } from "express";
import {
  loginUserService,
  registerUserService,
  saveRefreshTokenService,
} from "./auth.service.js";
import { accessTokenMaxAge, refreshTokenMaxAge } from "./auth.constant.js";
import { generateAccessToken, generateRefreshToken } from "../../utils/jwt.js";
import { env } from "../../config/env.js";

const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "none" as const,
};
export const postRegisterHandler = async (req: Request, res: Response) => {
  // 1. Validate the request body using Zod schema
  const input = registerSchema.parse(req.body);
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
  res.cookie("refresh_token", refreshToken, {
    ...cookieOptions,
    maxAge: refreshTokenMaxAge,
  });

  // 5. Send the response with user data and access token
  res.status(201).json({
    success: true,
    message: "User registered successfully",
    user,
    accessToken,
  });
};

export const postLoginHandler = async (req: Request, res: Response) => {
  // 1. Validate the request body using Zod schema
  const input = loginSchema.parse(req.body);
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
  res.cookie("refresh_token", refreshToken, {
    ...cookieOptions,
    maxAge: refreshTokenMaxAge,
  });

  return res.status(200).json({
    success: true,
    message: "User logged in successfully",
    user,
    accessToken,
  });
};
