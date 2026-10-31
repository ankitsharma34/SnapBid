import { Router } from "express";
import { updateUserProfileSchema } from "@snapbid/shared";
import { authenticate } from "../../middlewares/authenticate.js";
import { validateBody } from "../../middlewares/validate-request.js";
import {
  getCurrentUserProfile,
  patchCurrentUserProfile,
} from "./user.controller.js";

const router = Router();

router.get("/me", authenticate, getCurrentUserProfile);
router.patch(
  "/me",
  authenticate,
  validateBody(updateUserProfileSchema),
  patchCurrentUserProfile,
);

export default router;
