"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPriceHistory = exports.getCurrentPrice = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
// ─── GET CURRENT PRICE + MARKET DATA ─────────────────────────
const getCurrentPrice = async (req, res) => {
    try {
        const settings = await prisma_1.default.siteSettings.findFirst();
        if (!settings) {
            return res.status(404).json({
                success: false,
                message: "Price not configured yet",
            });
        }
        // Get price from 24 hours ago
        const price24hAgo = await prisma_1.default.priceHistory.findFirst({
            where: {
                createdAt: {
                    lte: new Date(Date.now() - 24 * 60 * 60 * 1000),
                },
            },
            orderBy: { createdAt: "desc" },
        });
        // Calculate 24h change percentage
        let change24h = 0;
        if (price24hAgo) {
            change24h = parseFloat((((settings.currentPrice - price24hAgo.price) / price24hAgo.price) *
                100).toFixed(2));
        }
        // Market cap = current price × total supply
        const marketCap = parseFloat((settings.currentPrice * settings.totalSupply).toFixed(2));
        return res.status(200).json({
            success: true,
            data: {
                currentPrice: settings.currentPrice,
                change24h,
                volume: settings.volume,
                marketCap,
                totalSupply: settings.totalSupply,
            },
        });
    }
    catch (error) {
        console.error("Get Current Price Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};
exports.getCurrentPrice = getCurrentPrice;
// ─── GET PRICE HISTORY BY RANGE ───────────────────────────────
const getPriceHistory = async (req, res) => {
    const { range } = req.params;
    // Map range to hours
    const rangeMap = {
        "24H": 24,
        "7D": 24 * 7,
        "30D": 24 * 30,
        "90D": 24 * 90,
        "1Y": 24 * 365,
    };
    const hours = rangeMap[range];
    if (!hours) {
        return res.status(400).json({
            success: false,
            message: "Invalid range. Use 24H, 7D, 30D, 90D or 1Y",
        });
    }
    try {
        const fromDate = new Date(Date.now() - hours * 60 * 60 * 1000);
        const history = await prisma_1.default.priceHistory.findMany({
            where: {
                createdAt: { gte: fromDate },
            },
            orderBy: { createdAt: "asc" },
            select: {
                price: true,
                createdAt: true,
            },
        });
        // Format for chart
        const formatted = history.map((entry) => ({
            price: entry.price,
            time: entry.createdAt.toISOString(),
        }));
        // Calculate stats for this range
        if (formatted.length === 0) {
            return res.status(200).json({
                success: true,
                data: {
                    history: [],
                    high: 0,
                    low: 0,
                    open: 0,
                    change: 0,
                },
            });
        }
        const prices = formatted.map((e) => e.price);
        const high = parseFloat(Math.max(...prices).toFixed(4));
        const low = parseFloat(Math.min(...prices).toFixed(4));
        const open = formatted[0].price;
        const close = formatted[formatted.length - 1].price;
        const change = parseFloat((((close - open) / open) * 100).toFixed(2));
        return res.status(200).json({
            success: true,
            data: {
                history: formatted,
                high,
                low,
                open,
                change,
            },
        });
    }
    catch (error) {
        console.error("Get Price History Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};
exports.getPriceHistory = getPriceHistory;
