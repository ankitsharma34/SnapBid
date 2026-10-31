import { prisma } from "@snapbid/database";
import type { UpdateUserProfileInput } from "@snapbid/shared";

const publicProfileSelect = {
  id: true,
  username: true,
  displayName: true,
  avatarUrl: true,
} as const;

export const findPublicUserProfileById = (userId: string) => {
  return prisma.user.findUnique({
    where: { id: userId },
    select: publicProfileSelect,
  });
};

export const updateUserProfile = (
  userId: string,
  input: UpdateUserProfileInput,
) => {
  return prisma.user.update({
    where: { id: userId },
    data: {
      ...(input.username !== undefined ? { username: input.username } : {}),
      ...(input.displayName !== undefined
        ? { displayName: input.displayName }
        : {}),
      ...(input.avatarUrl !== undefined ? { avatarUrl: input.avatarUrl } : {}),
    },
    select: publicProfileSelect,
  });
};
