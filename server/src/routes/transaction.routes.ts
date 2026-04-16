import { Router } from "express";
import {
  submitDeposit,
  submitWithdrawal,
  getDepositWallets,
  getTransaction,
} from "../controllers/transaction.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

router.use(protect);

router.get("/wallets", getDepositWallets);
router.get("/:id", getTransaction);
router.post("/deposit", submitDeposit);
router.post("/withdraw", submitWithdrawal);

export default router;
