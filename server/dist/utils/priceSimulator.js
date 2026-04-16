"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stopPriceSimulator = exports.startPriceSimulator = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
let simulatorInterval = null;
// ─── FLUCTUATION LOGIC ────────────────────────────────────────
const getRandomFluctuation = (currentPrice) => {
    // Fluctuate between -0.5% and +0.5% every 15 seconds
    const percentage = (Math.random() - 0.5) * 0.01;
    const change = currentPrice * percentage;
    return parseFloat((currentPrice + change).toFixed(4));
};
// ─── START SIMULATOR ──────────────────────────────────────────
const startPriceSimulator = async () => {
    const settings = await prisma_1.default.siteSettings.findFirst();
    if (!settings) {
        console.error("❌ No site settings found. Run: pnpm db:seed");
        return;
    }
    if (settings.currentPrice <= 0) {
        console.error("❌ Current price is 0. Run: pnpm db:seed");
        return;
    }
    console.log(`🚀 Price simulator started — base price: $${settings.currentPrice}`);
    simulatorInterval = setInterval(async () => {
        try {
            const latest = await prisma_1.default.siteSettings.findFirst();
            if (!latest || latest.currentPrice <= 0)
                return;
            const newPrice = getRandomFluctuation(latest.currentPrice);
            await prisma_1.default.siteSettings.update({
                where: { id: latest.id },
                data: { currentPrice: newPrice },
            });
            await prisma_1.default.priceHistory.create({
                data: { price: newPrice },
            });
            console.log(`📈 $${newPrice} — ${new Date().toLocaleTimeString()}`);
        }
        catch (error) {
            console.error("Simulator error:", error);
        }
    }, 15000);
};
exports.startPriceSimulator = startPriceSimulator;
// ─── STOP SIMULATOR ───────────────────────────────────────────
const stopPriceSimulator = () => {
    if (simulatorInterval) {
        clearInterval(simulatorInterval);
        simulatorInterval = null;
        console.log("⛔ Price simulator stopped");
    }
};
exports.stopPriceSimulator = stopPriceSimulator;
