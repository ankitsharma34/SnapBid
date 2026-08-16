import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import {
  getAuctions,
  getAuctionById,
  postAuction,
  editAuction,
} from "./auction.controller.js";

const router = Router();

router.get("/", authenticate, getAuctions);
router.post("/", authenticate, postAuction);
router.get("/:id", authenticate, getAuctionById);
router.patch("/:id", authenticate, editAuction);

export default router;
