import prisma from "../lib/prisma";

let simulatorInterval: NodeJS.Timeout | null = null;

// ─── FLUCTUATION LOGIC ────────────────────────────────────────
const getRandomFluctuation = (currentPrice: number): number => {
  // Fluctuate between -0.5% and +0.5% every 15 seconds
  const percentage = (Math.random() - 0.5) * 0.01;
  const change = currentPrice * percentage;
  return parseFloat((currentPrice + change).toFixed(4));
};

// ─── START SIMULATOR ──────────────────────────────────────────
export const startPriceSimulator = async () => {
  const settings = await prisma.siteSettings.findFirst();

  if (!settings) {
    console.error("❌ No site settings found. Run: pnpm db:seed");
    return;
  }

  if (settings.currentPrice <= 0) {
    console.error("❌ Current price is 0. Run: pnpm db:seed");
    return;
  }

  console.log(
    `🚀 Price simulator started — base price: $${settings.currentPrice}`,
  );

  simulatorInterval = setInterval(async () => {
    try {
      const latest = await prisma.siteSettings.findFirst();
      if (!latest || latest.currentPrice <= 0) return;

      const newPrice = getRandomFluctuation(latest.currentPrice);

      await prisma.siteSettings.update({
        where: { id: latest.id },
        data: { currentPrice: newPrice },
      });

      await prisma.priceHistory.create({
        data: { price: newPrice },
      });

      console.log(`📈 $${newPrice} — ${new Date().toLocaleTimeString()}`);
    } catch (error) {
      console.error("Simulator error:", error);
    }
  }, 15000);
};

// ─── STOP SIMULATOR ───────────────────────────────────────────
export const stopPriceSimulator = () => {
  if (simulatorInterval) {
    clearInterval(simulatorInterval);
    simulatorInterval = null;
    console.log("⛔ Price simulator stopped");
  }
};
