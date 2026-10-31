import { Router } from "express";
import { loginSchema, registerSchema } from "@snapbid/shared";
import { validateBody } from "../../middlewares/validate-request.js";
import {
  postLoginHandler,
  postLogoutHandler,
  postRefreshHandler,
  postRegisterHandler,
} from "./auth.controller.js";

const router = Router();

router.post("/register", validateBody(registerSchema), postRegisterHandler);
router.post("/login", validateBody(loginSchema), postLoginHandler);
router.post("/refresh", postRefreshHandler);
router.post("/logout", postLogoutHandler);

export default router;
