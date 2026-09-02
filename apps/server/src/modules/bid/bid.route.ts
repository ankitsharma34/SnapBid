import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import { postBid } from "./bid.controller.js";

const router = Router();

router.post("/", authenticate, postBid);

export default router;
