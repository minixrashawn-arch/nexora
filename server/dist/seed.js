"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("./lib/prisma"));
async function main() {
    // Create initial site settings
    const existing = await prisma_1.default.siteSettings.findFirst();
    if (!existing) {
        await prisma_1.default.siteSettings.create({
            data: {
                currentPrice: 10.53,
                totalSupply: 100000000,
                volume: 12320000,
                usdtWallet: "",
                usdcWallet: "",
                btcWallet: "",
                promoActive: false,
                promoText: "",
            },
        });
        // Seed initial price history
        await prisma_1.default.priceHistory.create({
            data: { price: 10.53 },
        });
        console.log("✅ Seed complete");
    }
    else {
        console.log("⚠️ Settings already exist, skipping seed");
    }
    await prisma_1.default.$disconnect();
}
main();
