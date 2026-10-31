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

export const rotateRefreshToken = async ({
  userId,
  currentToken,
  nextToken,
  nextExpiresAt,
}: {
  userId: string;
  currentToken: string;
  nextToken: string;
  nextExpiresAt: Date;
}) => {
  return prisma.$transaction(async (tx) => {
    const storedToken = await tx.refreshToken.findUnique({
      where: { token: currentToken },
      select: {
        id: true,
        userId: true,
        expiresAt: true,
        user: {
          select: {
            id: true,
            role: true,
          },
        },
      },
    });

    if (
      !storedToken ||
      storedToken.userId !== userId ||
      storedToken.expiresAt <= new Date()
    ) {
      return null;
    }

    // Only one concurrent request can revoke this token and create a
    // replacement, preventing successful refresh-token reuse.
    const revoked = await tx.refreshToken.deleteMany({
      where: {
        id: storedToken.id,
        token: currentToken,
        expiresAt: { gt: new Date() },
      },
    });

    if (revoked.count !== 1) {
      return null;
    }

    await tx.refreshToken.create({
      data: {
        userId,
        token: nextToken,
        expiresAt: nextExpiresAt,
      },
    });

    return storedToken.user;
  });
};
