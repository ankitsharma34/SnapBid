import type { Request, Response } from "express";
import { getCurrentUserProfileService } from "./user.service.js";

export const getCurrentUserProfile = async (req: Request, res: Response) => {
  const profile = await getCurrentUserProfileService(req.user!.userId);

  return res.status(200).json({
    success: true,
    message: "User profile fetched successfully",
    data: profile,
  });
};
