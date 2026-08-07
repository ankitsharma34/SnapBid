import { User } from "../../../generated/prisma/client.js";

export const toUserResponse = (user: User) => {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    role: user.role,
    isEmailVerified: user.isEmailVerified,
  };
};
