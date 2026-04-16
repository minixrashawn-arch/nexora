"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = require("../controllers/admin.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// All admin routes require auth + admin role
router.use(auth_middleware_1.protect, auth_middleware_1.adminOnly);
// Overview
router.get("/stats", admin_controller_1.getOverviewStats);
// Users
router.get("/users", admin_controller_1.getAllUsers);
router.patch("/users/:id/toggle-status", admin_controller_1.toggleUserStatus);
router.patch("/users/:id/balance", admin_controller_1.adjustUserBalance);
// Deposits
router.get("/deposits", admin_controller_1.getAllDeposits);
router.patch("/deposits/:id/approve", admin_controller_1.approveDeposit);
router.patch("/deposits/:id/reject", admin_controller_1.rejectDeposit);
// Withdrawals
router.get("/withdrawals", admin_controller_1.getAllWithdrawals);
router.patch("/withdrawals/:id/approve", admin_controller_1.approveWithdrawal);
router.patch("/withdrawals/:id/reject", admin_controller_1.rejectWithdrawal);
// Price
router.patch("/price", admin_controller_1.updatePrice);
// Wallets
router.patch("/wallets", admin_controller_1.updateWallets);
// Site Settings
router.get("/settings", admin_controller_1.getSiteSettings);
router.patch("/settings", admin_controller_1.updateSiteSettings);
exports.default = router;
