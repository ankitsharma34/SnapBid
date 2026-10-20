import { Router } from "express";
import { loginSchema, registerSchema } from "@snapbid/shared";
import { validateBody } from "../../middlewares/validate-request.js";
import { postLoginHandler, postRegisterHandler } from "./auth.controller.js";

const router = Router();

router.post("/register", validateBody(registerSchema), postRegisterHandler);
router.post("/login", validateBody(loginSchema), postLoginHandler);

export default router;
