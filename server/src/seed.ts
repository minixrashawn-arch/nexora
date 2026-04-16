import prisma from "./lib/prisma";

async function main() {
  // Create initial site settings
  const existing = await prisma.siteSettings.findFirst();

  if (!existing) {
    await prisma.siteSettings.create({
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
    await prisma.priceHistory.create({
      data: { price: 10.53 },
    });

    console.log("✅ Seed complete");
  } else {
    console.log("⚠️ Settings already exist, skipping seed");
  }

  await prisma.$disconnect();
}

main();
