import { Router } from "express";
import { bidSchema } from "@snapbid/shared";
import { authenticate } from "../../middlewares/authenticate.js";
import {
  validateBody,
  validateParams,
} from "../../middlewares/validate-request.js";
import { auctionIdParamsSchema } from "../auction/auction.schema.js";
import { getBidHistory, postBid } from "./bid.controller.js";

const router = Router({ mergeParams: true });

router.post(
  "/",
  authenticate,
  validateParams(auctionIdParamsSchema),
  validateBody(bidSchema),
  postBid,
);
router.get(
  "/",
  authenticate,
  validateParams(auctionIdParamsSchema),
  getBidHistory,
);

export default router;
