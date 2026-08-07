import { Router } from "express";
import { postLoginHandler, postRegisterHandler } from "./auth.controller.js";

const router = Router();

router.post("/register", postRegisterHandler);
router.post("/login", postLoginHandler);

export default router;
