import { AppError } from "../../utils/app-error.js";
import { findPublicUserProfileById } from "./user.repository.js";

export const getCurrentUserProfileService = async (userId: string) => {
  const profile = await findPublicUserProfileById(userId);

  if (!profile) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }

  return profile;
};
