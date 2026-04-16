"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// All routes protected
router.use(auth_middleware_1.protect);
router.get("/profile", user_controller_1.getProfile);
router.get("/balance", user_controller_1.getBalance);
router.get("/transactions", user_controller_1.getTransactionHistory);
router.put("/profile", user_controller_1.updateProfile);
router.put("/change-password", user_controller_1.changePassword);
exports.default = router;
