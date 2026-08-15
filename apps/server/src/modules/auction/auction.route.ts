import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import { getAuctions } from "./auction.controller.js";

const router = Router();

router.get("/", authenticate, getAuctions);

export default router;
