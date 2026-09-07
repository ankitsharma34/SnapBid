import { registerDto } from "@snapbid/shared";
import { prisma } from "@snapbid/database";

export const findUserByUsername = async (username: string) => {
  const user = await prisma.user.findUnique({
    where: { username },
  });
  return user;
};

export const findUserByEmail = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });
  return user;
};

export const createUser = async (input: registerDto) => {
  const user = await prisma.user.create({
    data: input,
  });
  return user;
};

export const saveRefreshToken = async (tokenData: {
  userId: string;
  token: string;
  expiresAt: Date;
}) => {
  await prisma.refreshToken.create({
    data: tokenData,
  });
};
