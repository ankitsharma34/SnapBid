import { Router } from "express";
import { postRegisterHandler } from "./auth.controller.js";

const router = Router();

router.post("/register", postRegisterHandler);

export default router;
