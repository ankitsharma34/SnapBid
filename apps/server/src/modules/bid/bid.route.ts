import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import { getBidHistory, postBid } from "./bid.controller.js";

const router = Router();

router.post("/", authenticate, postBid);
router.get("/", authenticate, getBidHistory);

export default router;
