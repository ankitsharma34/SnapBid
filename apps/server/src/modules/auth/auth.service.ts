import { loginDto, registerDto } from "@snapbid/shared";
import { AppError } from "../../utils/app-error.js";
import {
  createUser,
  findUserByEmail,
  findUserByUsername,
  rotateRefreshToken,
  saveRefreshToken,
} from "./auth.repository.js";
import { hashPassword, verifyPassword } from "../../utils/hash-password.js";
import { hashToken } from "../../utils/hash-token.js";
import { refreshTokenMaxAge } from "./auth.constant.js";
import { toUserResponse } from "./auth.mapper.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt.js";

export const registerUserService = async (input: registerDto) => {
  // 1. Check if the username or email already exists in the database
  const [usernameUser, emailUser] = await Promise.all([
    findUserByUsername(input.username),
    findUserByEmail(input.email),
  ]);
  if (usernameUser) {
    throw new AppError("Username already exists", 409);
  }
  if (emailUser) {
    throw new AppError("Email already exists", 409);
  }

  // 2. Hash the password and create a new user in the database
  const hashedPassword = await hashPassword(input.password);
  const newUser = await createUser({ ...input, password: hashedPassword });

  return toUserResponse(newUser);
};

export const saveRefreshTokenService = async (
  userId: string,
  refreshToken: string,
) => {
  const hashedRefreshToken = hashToken(refreshToken);
  const expiresAt = new Date(Date.now() + refreshTokenMaxAge);
  await saveRefreshToken({ userId, token: hashedRefreshToken, expiresAt });
};

export const loginUserService = async (input: loginDto) => {
  // 1. Find the user by email
  const user = await findUserByEmail(input.email);
  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }
  // 2. Verify the password
  const isPasswordValid = await verifyPassword({
    inputPassword: input.password,
    hashedPassword: user.password,
  });
  if (!isPasswordValid) {
    throw new AppError("Invalid credentials", 401);
  }
  return toUserResponse(user);
};

export const refreshAccessTokenService = async (refreshToken: string) => {
  const payload = verifyRefreshToken(refreshToken);
  const nextRefreshToken = generateRefreshToken({ userId: payload.userId });

  const user = await rotateRefreshToken({
    userId: payload.userId,
    currentToken: hashToken(refreshToken),
    nextToken: hashToken(nextRefreshToken),
    nextExpiresAt: new Date(Date.now() + refreshTokenMaxAge),
  });

  if (!user) {
    throw new AppError(
      "Invalid or expired refresh token",
      401,
      "INVALID_REFRESH_TOKEN",
    );
  }

  return {
    accessToken: generateAccessToken({
      userId: user.id,
      role: user.role,
    }),
    refreshToken: nextRefreshToken,
  };
};
