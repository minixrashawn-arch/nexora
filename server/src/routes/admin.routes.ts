import { Router } from "express";
import {
  getOverviewStats,
  getAllUsers,
  toggleUserStatus,
  adjustUserBalance,
  getAllDeposits,
  approveDeposit,
  rejectDeposit,
  getAllWithdrawals,
  approveWithdrawal,
  rejectWithdrawal,
  updatePrice,
  updateWallets,
  updateSiteSettings,
  getSiteSettings,
} from "../controllers/admin.controller";
import { protect, adminOnly } from "../middleware/auth.middleware";

const router = Router();

// All admin routes require auth + admin role
router.use(protect, adminOnly);

// Overview
router.get("/stats", getOverviewStats);

// Users
router.get("/users", getAllUsers);
router.patch("/users/:id/toggle-status", toggleUserStatus);
router.patch("/users/:id/balance", adjustUserBalance);

// Deposits
router.get("/deposits", getAllDeposits);
router.patch("/deposits/:id/approve", approveDeposit);
router.patch("/deposits/:id/reject", rejectDeposit);

// Withdrawals
router.get("/withdrawals", getAllWithdrawals);
router.patch("/withdrawals/:id/approve", approveWithdrawal);
router.patch("/withdrawals/:id/reject", rejectWithdrawal);

// Price
router.patch("/price", updatePrice);

// Wallets
router.patch("/wallets", updateWallets);

// Site Settings
router.get("/settings", getSiteSettings);
router.patch("/settings", updateSiteSettings);

export default router;
