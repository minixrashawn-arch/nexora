"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSiteSettings = exports.updateSiteSettings = exports.updateWallets = exports.updatePrice = exports.rejectWithdrawal = exports.approveWithdrawal = exports.getAllWithdrawals = exports.rejectDeposit = exports.approveDeposit = exports.getAllDeposits = exports.adjustUserBalance = exports.toggleUserStatus = exports.getAllUsers = exports.getOverviewStats = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
// ─── OVERVIEW STATS ───────────────────────────────────────────
const getOverviewStats = async (req, res) => {
    try {
        const totalUsers = await prisma_1.default.user.count({
            where: { role: "USER" },
        });
        const totalDeposits = await prisma_1.default.transaction.aggregate({
            where: { type: "DEPOSIT", status: "APPROVED" },
            _sum: { amount: true },
            _count: true,
        });
        const totalWithdrawals = await prisma_1.default.transaction.aggregate({
            where: { type: "WITHDRAWAL", status: "APPROVED" },
            _sum: { amount: true },
            _count: true,
        });
        const pendingDeposits = await prisma_1.default.transaction.count({
            where: { type: "DEPOSIT", status: "PENDING" },
        });
        const pendingWithdrawals = await prisma_1.default.transaction.count({
            where: { type: "WITHDRAWAL", status: "PENDING" },
        });
        const settings = await prisma_1.default.siteSettings.findFirst();
        return res.status(200).json({
            success: true,
            data: {
                totalUsers,
                totalDeposits: {
                    count: totalDeposits._count,
                    amount: totalDeposits._sum.amount ?? 0,
                },
                totalWithdrawals: {
                    count: totalWithdrawals._count,
                    amount: totalWithdrawals._sum.amount ?? 0,
                },
                pendingDeposits,
                pendingWithdrawals,
                currentPrice: settings?.currentPrice ?? 0,
            },
        });
    }
    catch (error) {
        console.error("Get Overview Stats Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};
exports.getOverviewStats = getOverviewStats;
// ─── GET ALL USERS ────────────────────────────────────────────
const getAllUsers = async (req, res) => {
    try {
        const users = await prisma_1.default.user.findMany({
            where: { role: "USER" },
            select: {
                id: true,
                name: true,
                email: true,
                nexoraBalance: true,
                isActive: true,
                createdAt: true,
                transactions: {
                    select: {
                        type: true,
                        amount: true,
                        status: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });
        // Calculate total deposited and withdrawn per user
        const formatted = users.map((user) => {
            const totalDeposited = user.transactions
                .filter((t) => t.type === "DEPOSIT" && t.status === "APPROVED")
                .reduce((sum, t) => sum + t.amount, 0);
            const totalWithdrawn = user.transactions
                .filter((t) => t.type === "WITHDRAWAL" && t.status === "APPROVED")
                .reduce((sum, t) => sum + t.amount, 0);
            return {
                id: user.id,
                name: user.name,
                email: user.email,
                nexoraBalance: user.nexoraBalance,
                isActive: user.isActive,
                createdAt: user.createdAt,
                totalDeposited: parseFloat(totalDeposited.toFixed(2)),
                totalWithdrawn: parseFloat(totalWithdrawn.toFixed(2)),
            };
        });
        return res.status(200).json({
            success: true,
            data: formatted,
        });
    }
    catch (error) {
        console.error("Get All Users Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};
exports.getAllUsers = getAllUsers;
// ─── SUSPEND / ACTIVATE USER ──────────────────────────────────
const toggleUserStatus = async (req, res) => {
    const { id } = req.params;
    if (typeof id !== "string") {
        return res.status(400).json({
            success: false,
            message: "Invalid user ID",
        });
    }
    try {
        const user = await prisma_1.default.user.findUnique({ where: { id } });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        const updated = await prisma_1.default.user.update({
            where: { id },
            data: { isActive: !user.isActive },
            select: { id: true, name: true, isActive: true },
        });
        return res.status(200).json({
            success: true,
            message: `User ${updated.isActive ? "activated" : "suspended"} successfully`,
            data: updated,
        });
    }
    catch (error) {
        console.error("Toggle User Status Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};
exports.toggleUserStatus = toggleUserStatus;
// ─── ADJUST USER BALANCE MANUALLY ─────────────────────────────
const adjustUserBalance = async (req, res) => {
    const { id } = req.params;
    const { amount, action } = req.body;
    // action: "ADD" or "SUBTRACT"
    if (typeof id !== "string") {
        return res.status(400).json({
            success: false,
            message: "Invalid user ID",
        });
    }
    if (!amount || !action) {
        return res.status(400).json({
            success: false,
            message: "Amount and action are required",
        });
    }
    if (!["ADD", "SUBTRACT"].includes(action)) {
        return res.status(400).json({
            success: false,
            message: "Action must be ADD or SUBTRACT",
        });
    }
    try {
        const user = await prisma_1.default.user.findUnique({ where: { id } });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        if (action === "SUBTRACT" && user.nexoraBalance < amount) {
            return res.status(400).json({
                success: false,
                message: "User does not have enough balance to subtract",
            });
        }
        const updated = await prisma_1.default.user.update({
            where: { id },
            data: {
                nexoraBalance: action === "ADD"
                    ? { increment: parseFloat(amount) }
                    : { decrement: parseFloat(amount) },
            },
            select: { id: true, name: true, nexoraBalance: true },
        });
        return res.status(200).json({
            success: true,
            message: `Balance ${action === "ADD" ? "increased" : "decreased"} successfully`,
            data: updated,
        });
    }
    catch (error) {
        console.error("Adjust Balance Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};
exports.adjustUserBalance = adjustUserBalance;
// ─── GET ALL DEPOSITS ─────────────────────────────────────────
const getAllDeposits = async (req, res) => {
    const { status } = req.query;
    try {
        const deposits = await prisma_1.default.transaction.findMany({
            where: {
                type: "DEPOSIT",
                ...(status && { status: status }),
            },
            include: {
                user: {
                    select: { id: true, name: true, email: true },
                },
            },
            orderBy: { createdAt: "desc" },
        });
        return res.status(200).json({
            success: true,
            data: deposits,
        });
    }
    catch (error) {
        console.error("Get All Deposits Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};
exports.getAllDeposits = getAllDeposits;
// ─── APPROVE DEPOSIT ──────────────────────────────────────────
const approveDeposit = async (req, res) => {
    const { id } = req.params;
    if (typeof id !== "string") {
        return res.status(400).json({
            success: false,
            message: "Invalid user ID",
        });
    }
    try {
        const transaction = await prisma_1.default.transaction.findUnique({
            where: { id },
        });
        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: "Transaction not found",
            });
        }
        if (transaction.type !== "DEPOSIT") {
            return res.status(400).json({
                success: false,
                message: "This is not a deposit transaction",
            });
        }
        if (transaction.status !== "PENDING") {
            return res.status(400).json({
                success: false,
                message: `Transaction already ${transaction.status.toLowerCase()}`,
            });
        }
        // Credit NEXORA to user and mark approved
        await prisma_1.default.$transaction([
            prisma_1.default.user.update({
                where: { id: transaction.userId },
                data: {
                    nexoraBalance: {
                        increment: transaction.nexoraAmount ?? 0,
                    },
                },
            }),
            prisma_1.default.transaction.update({
                where: { id },
                data: { status: "APPROVED" },
            }),
        ]);
        return res.status(200).json({
            success: true,
            message: "Deposit approved, NEXORA credited to user",
        });
    }
    catch (error) {
        console.error("Approve Deposit Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};
exports.approveDeposit = approveDeposit;
// ─── REJECT DEPOSIT ───────────────────────────────────────────
const rejectDeposit = async (req, res) => {
    const { id } = req.params;
    if (typeof id !== "string") {
        return res.status(400).json({
            success: false,
            message: "Invalid user ID",
        });
    }
    try {
        const transaction = await prisma_1.default.transaction.findUnique({
            where: { id },
        });
        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: "Transaction not found",
            });
        }
        if (transaction.status !== "PENDING") {
            return res.status(400).json({
                success: false,
                message: `Transaction already ${transaction.status.toLowerCase()}`,
            });
        }
        await prisma_1.default.transaction.update({
            where: { id },
            data: { status: "REJECTED" },
        });
        return res.status(200).json({
            success: true,
            message: "Deposit rejected",
        });
    }
    catch (error) {
        console.error("Reject Deposit Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};
exports.rejectDeposit = rejectDeposit;
// ─── GET ALL WITHDRAWALS ──────────────────────────────────────
const getAllWithdrawals = async (req, res) => {
    const { status } = req.query;
    try {
        const withdrawals = await prisma_1.default.transaction.findMany({
            where: {
                type: "WITHDRAWAL",
                ...(status && { status: status }),
            },
            include: {
                user: {
                    select: { id: true, name: true, email: true },
                },
            },
            orderBy: { createdAt: "desc" },
        });
        return res.status(200).json({
            success: true,
            data: withdrawals,
        });
    }
    catch (error) {
        console.error("Get All Withdrawals Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};
exports.getAllWithdrawals = getAllWithdrawals;
// ─── APPROVE WITHDRAWAL ───────────────────────────────────────
const approveWithdrawal = async (req, res) => {
    const { id } = req.params;
    if (typeof id !== "string") {
        return res.status(400).json({
            success: false,
            message: "Invalid user ID",
        });
    }
    try {
        const transaction = await prisma_1.default.transaction.findUnique({
            where: { id },
        });
        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: "Transaction not found",
            });
        }
        if (transaction.type !== "WITHDRAWAL") {
            return res.status(400).json({
                success: false,
                message: "This is not a withdrawal transaction",
            });
        }
        if (transaction.status !== "PENDING") {
            return res.status(400).json({
                success: false,
                message: `Transaction already ${transaction.status.toLowerCase()}`,
            });
        }
        // Balance already deducted on submission so just mark approved
        await prisma_1.default.transaction.update({
            where: { id },
            data: { status: "APPROVED" },
        });
        return res.status(200).json({
            success: true,
            message: "Withdrawal approved. Remember to send the crypto manually.",
            data: {
                walletAddress: transaction.walletAddress,
                amount: transaction.amount,
                currency: transaction.currency,
            },
        });
    }
    catch (error) {
        console.error("Approve Withdrawal Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};
exports.approveWithdrawal = approveWithdrawal;
// ─── REJECT WITHDRAWAL ────────────────────────────────────────
const rejectWithdrawal = async (req, res) => {
    const { id } = req.params;
    if (typeof id !== "string") {
        return res.status(400).json({
            success: false,
            message: "Invalid user ID",
        });
    }
    try {
        const transaction = await prisma_1.default.transaction.findUnique({
            where: { id },
        });
        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: "Transaction not found",
            });
        }
        if (transaction.status !== "PENDING") {
            return res.status(400).json({
                success: false,
                message: `Transaction already ${transaction.status.toLowerCase()}`,
            });
        }
        // Refund NEXORA back to user and mark rejected
        await prisma_1.default.$transaction([
            prisma_1.default.user.update({
                where: { id: transaction.userId },
                data: {
                    nexoraBalance: {
                        increment: transaction.nexoraAmount ?? 0,
                    },
                },
            }),
            prisma_1.default.transaction.update({
                where: { id },
                data: { status: "REJECTED" },
            }),
        ]);
        return res.status(200).json({
            success: true,
            message: "Withdrawal rejected, NEXORA refunded to user",
        });
    }
    catch (error) {
        console.error("Reject Withdrawal Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};
exports.rejectWithdrawal = rejectWithdrawal;
// ─── UPDATE PRICE ─────────────────────────────────────────────
const updatePrice = async (req, res) => {
    const { price } = req.body;
    if (!price || price <= 0) {
        return res.status(400).json({
            success: false,
            message: "Valid price is required",
        });
    }
    try {
        // Update site settings
        const settings = await prisma_1.default.siteSettings.findFirst();
        if (!settings) {
            return res.status(404).json({
                success: false,
                message: "Site settings not found, run seed first",
            });
        }
        await prisma_1.default.siteSettings.update({
            where: { id: settings.id },
            data: { currentPrice: parseFloat(price) },
        });
        // Save to price history so chart updates
        await prisma_1.default.priceHistory.create({
            data: { price: parseFloat(price) },
        });
        return res.status(200).json({
            success: true,
            message: "Price updated successfully",
            data: { currentPrice: parseFloat(price) },
        });
    }
    catch (error) {
        console.error("Update Price Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};
exports.updatePrice = updatePrice;
// ─── UPDATE WALLET ADDRESSES ──────────────────────────────────
const updateWallets = async (req, res) => {
    const { usdtWallet, usdcWallet, btcWallet } = req.body;
    if (!usdtWallet && !usdcWallet && !btcWallet) {
        return res.status(400).json({
            success: false,
            message: "At least one wallet address is required",
        });
    }
    try {
        const settings = await prisma_1.default.siteSettings.findFirst();
        if (!settings) {
            return res.status(404).json({
                success: false,
                message: "Site settings not found, run seed first",
            });
        }
        const updated = await prisma_1.default.siteSettings.update({
            where: { id: settings.id },
            data: {
                ...(usdtWallet && { usdtWallet }),
                ...(usdcWallet && { usdcWallet }),
                ...(btcWallet && { btcWallet }),
            },
            select: {
                usdtWallet: true,
                usdcWallet: true,
                btcWallet: true,
            },
        });
        return res.status(200).json({
            success: true,
            message: "Wallet addresses updated successfully",
            data: updated,
        });
    }
    catch (error) {
        console.error("Update Wallets Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};
exports.updateWallets = updateWallets;
// ─── UPDATE SITE SETTINGS ─────────────────────────────────────
const updateSiteSettings = async (req, res) => {
    const { totalSupply, volume, promoActive, promoText } = req.body;
    try {
        const settings = await prisma_1.default.siteSettings.findFirst();
        if (!settings) {
            return res.status(404).json({
                success: false,
                message: "Site settings not found, run seed first",
            });
        }
        const updated = await prisma_1.default.siteSettings.update({
            where: { id: settings.id },
            data: {
                ...(totalSupply !== undefined && {
                    totalSupply: parseFloat(totalSupply),
                }),
                ...(volume !== undefined && { volume: parseFloat(volume) }),
                ...(promoActive !== undefined && { promoActive }),
                ...(promoText !== undefined && { promoText }),
            },
        });
        return res.status(200).json({
            success: true,
            message: "Site settings updated successfully",
            data: updated,
        });
    }
    catch (error) {
        console.error("Update Site Settings Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};
exports.updateSiteSettings = updateSiteSettings;
// ─── GET SITE SETTINGS ────────────────────────────────────────
const getSiteSettings = async (req, res) => {
    try {
        const settings = await prisma_1.default.siteSettings.findFirst();
        return res.status(200).json({
            success: true,
            data: settings,
        });
    }
    catch (error) {
        console.error("Get Site Settings Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};
exports.getSiteSettings = getSiteSettings;
