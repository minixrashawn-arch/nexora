import { Router } from "express";
import {
  getProfile,
  getBalance,
  getTransactionHistory,
  updateProfile,
  changePassword,
} from "../controllers/user.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

// All routes protected
router.use(protect);

router.get("/profile", getProfile);
router.get("/balance", getBalance);
router.get("/transactions", getTransactionHistory);
router.put("/profile", updateProfile);
router.put("/change-password", changePassword);

export default router;
