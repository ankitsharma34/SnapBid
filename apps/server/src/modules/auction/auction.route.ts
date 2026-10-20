import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import { createAuctionSchema } from "@snapbid/shared";
import {
  validateBody,
  validateParams,
} from "../../middlewares/validate-request.js";
import {
  getAuctions,
  getAuctionById,
  postAuction,
  editAuction,
  cancelAuction,
} from "./auction.controller.js";

import bidRouter from "../bid/bid.route.js";
import { auctionIdParamsSchema } from "./auction.schema.js";

const router = Router();

router.get("/", authenticate, getAuctions);
router.post("/", authenticate, validateBody(createAuctionSchema), postAuction);
router.get(
  "/:id",
  authenticate,
  validateParams(auctionIdParamsSchema),
  getAuctionById,
);
router.patch(
  "/:id",
  authenticate,
  validateParams(auctionIdParamsSchema),
  validateBody(createAuctionSchema),
  editAuction,
);
router.patch(
  "/:id/cancel",
  authenticate,
  validateParams(auctionIdParamsSchema),
  cancelAuction,
);

// bidding routes
router.use("/:id/bids", bidRouter);

export default router;
