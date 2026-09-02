import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import {
  getAuctions,
  getAuctionById,
  postAuction,
  editAuction,
  cancelAuction,
} from "./auction.controller.js";

import bidRouter from "../bid/bid.route.js";

const router = Router();

router.get("/", authenticate, getAuctions);
router.post("/", authenticate, postAuction);
router.get("/:id", authenticate, getAuctionById);
router.patch("/:id", authenticate, editAuction);
router.patch("/:id/cancel", authenticate, cancelAuction);

// bidding routes
router.use("/:id/bids", bidRouter);

export default router;
