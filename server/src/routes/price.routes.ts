import { Router } from "express";
import {
  getCurrentPrice,
  getPriceHistory,
} from "../controllers/price.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

router.use(protect);

router.get("/current", getCurrentPrice);
router.get("/history/:range", getPriceHistory);

export default router;
