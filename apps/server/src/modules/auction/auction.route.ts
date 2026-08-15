import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import { getAuctions, getAuctionById } from "./auction.controller.js";

const router = Router();

router.get("/", authenticate, getAuctions);
router.get("/:id", authenticate, getAuctionById);

export default router;
