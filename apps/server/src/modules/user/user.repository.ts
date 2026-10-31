import { prisma } from "@snapbid/database";

export const findPublicUserProfileById = (userId: string) => {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      displayName: true,
      avatarUrl: true,
    },
  });
};
