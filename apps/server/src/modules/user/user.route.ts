import { Router } from "express";
import {
  sellerAuctionHistoryQuerySchema,
  updateUserProfileSchema,
  userBidHistoryQuerySchema,
} from "@snapbid/shared";
import { authenticate } from "../../middlewares/authenticate.js";
import {
  validateBody,
  validateQuery,
} from "../../middlewares/validate-request.js";
import {
  getCurrentUserProfile,
  getSellerAuctionHistory,
  getUserBidHistory,
  patchCurrentUserProfile,
} from "./user.controller.js";

const router = Router();

router.get("/me", authenticate, getCurrentUserProfile);
router.get(
  "/me/auctions",
  authenticate,
  validateQuery(sellerAuctionHistoryQuerySchema),
  getSellerAuctionHistory,
);
router.get(
  "/me/bids",
  authenticate,
  validateQuery(userBidHistoryQuerySchema),
  getUserBidHistory,
);
router.patch(
  "/me",
  authenticate,
  validateBody(updateUserProfileSchema),
  patchCurrentUserProfile,
);

export default router;
