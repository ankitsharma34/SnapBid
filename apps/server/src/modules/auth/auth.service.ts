import { registerDto } from "@snapbid/shared";
import { AppError } from "../../utils/app-error.js";
import {
  createUser,
  findUserByEmail,
  findUserByUsername,
  saveRefreshToken,
} from "./auth.repository.js";
import { hashPassword } from "../../utils/hash-password.js";
import { hashToken } from "../../utils/hash-token.js";
import { refreshTokenMaxAge } from "./auth.constant.js";

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
  return {
    id: newUser.id,
    username: newUser.username,
    email: newUser.email,
    displayName: newUser.displayName,
    avatarUrl: newUser.avatarUrl,
    role: newUser.role,
    isEmailVerified: newUser.isEmailVerified,
  };
};

export const saveRefreshTokenService = async (
  userId: string,
  refreshToken: string,
) => {
  const hashedRefreshToken = hashToken(refreshToken);
  const expiresAt = new Date(Date.now() + refreshTokenMaxAge);
  await saveRefreshToken({ userId, token: hashedRefreshToken, expiresAt });
};
