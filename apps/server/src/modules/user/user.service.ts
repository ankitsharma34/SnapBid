import { AppError } from "../../utils/app-error.js";
import type { UpdateUserProfileInput } from "@snapbid/shared";
import {
  findPublicUserProfileById,
  updateUserProfile,
} from "./user.repository.js";

export const getCurrentUserProfileService = async (userId: string) => {
  const profile = await findPublicUserProfileById(userId);

  if (!profile) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }

  return profile;
};

export const updateCurrentUserProfileService = (
  userId: string,
  input: UpdateUserProfileInput,
) => {
  return updateUserProfile(userId, input);
};
