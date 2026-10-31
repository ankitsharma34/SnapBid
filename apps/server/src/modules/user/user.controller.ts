import type { Request, Response } from "express";
import type { UpdateUserProfileInput } from "@snapbid/shared";
import { getValidatedBody } from "../../middlewares/validate-request.js";
import {
  getCurrentUserProfileService,
  updateCurrentUserProfileService,
} from "./user.service.js";

export const getCurrentUserProfile = async (req: Request, res: Response) => {
  const profile = await getCurrentUserProfileService(req.user!.userId);

  return res.status(200).json({
    success: true,
    message: "User profile fetched successfully",
    data: profile,
  });
};

export const patchCurrentUserProfile = async (req: Request, res: Response) => {
  const input = getValidatedBody<UpdateUserProfileInput>(req);
  const profile = await updateCurrentUserProfileService(
    req.user!.userId,
    input,
  );

  return res.status(200).json({
    success: true,
    message: "User profile updated successfully",
    data: profile,
  });
};
