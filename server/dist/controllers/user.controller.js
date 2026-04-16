"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.updateProfile = exports.getTransactionHistory = exports.getBalance = exports.getProfile = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
// ─── GET CURRENT USER PROFILE ────────────────────────────────
const getProfile = async (req, res) => {
    try {
        const user = await prisma_1.default.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                nexoraBalance: true,
                isActive: true,
                createdAt: true,
            },
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        return res.status(200).json({
            success: true,
            data: user,
        });
    }
    catch (error) {
        console.error("Get Profile Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};
exports.getProfile = getProfile;
// ─── GET USER BALANCE + PORTFOLIO VALUE ──────────────────────
const getBalance = async (req, res) => {
    try {
        const user = await prisma_1.default.user.findUnique({
            where: { id: req.user.id },
            select: { nexoraBalance: true },
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        // Get current price from site settings
        const settings = await prisma_1.default.siteSettings.findFirst();
        const currentPrice = settings?.currentPrice ?? 0;
        const portfolioValue = user.nexoraBalance * currentPrice;
        return res.status(200).json({
            success: true,
            data: {
                nexoraBalance: user.nexoraBalance,
                currentPrice,
                portfolioValue: parseFloat(portfolioValue.toFixed(2)),
            },
        });
    }
    catch (error) {
        console.error("Get Balance Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};
exports.getBalance = getBalance;
// ─── GET USER TRANSACTION HISTORY ────────────────────────────
const getTransactionHistory = async (req, res) => {
    try {
        const transactions = await prisma_1.default.transaction.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: "desc" },
        });
        return res.status(200).json({
            success: true,
            data: transactions,
        });
    }
    catch (error) {
        console.error("Get Transactions Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};
exports.getTransactionHistory = getTransactionHistory;
// ─── UPDATE PROFILE ───────────────────────────────────────────
const updateProfile = async (req, res) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ message: "Name is required" });
    }
    try {
        const updated = await prisma_1.default.user.update({
            where: { id: req.user.id },
            data: { name },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
            },
        });
        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: updated,
        });
    }
    catch (error) {
        console.error("Update Profile Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};
exports.updateProfile = updateProfile;
// ─── CHANGE PASSWORD ──────────────────────────────────────────
const changePassword = async (req, res) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    if (!currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({ message: "All fields are required" });
    }
    if (newPassword !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
    }
    if (newPassword.length < 6) {
        return res
            .status(400)
            .json({ message: "Password must be at least 6 characters" });
    }
    try {
        const user = await prisma_1.default.user.findUnique({
            where: { id: req.user.id },
        });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const bcrypt = await Promise.resolve().then(() => __importStar(require("bcryptjs")));
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Current password is incorrect" });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 8);
        await prisma_1.default.user.update({
            where: { id: req.user.id },
            data: { password: hashedPassword },
        });
        return res.status(200).json({
            success: true,
            message: "Password changed successfully",
        });
    }
    catch (error) {
        console.error("Change Password Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};
exports.changePassword = changePassword;
