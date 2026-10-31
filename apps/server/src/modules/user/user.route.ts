import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import { getCurrentUserProfile } from "./user.controller.js";

const router = Router();

router.get("/me", authenticate, getCurrentUserProfile);

export default router;
