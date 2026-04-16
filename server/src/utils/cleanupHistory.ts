import prisma from "../lib/prisma";

export const runPriceHistoryMaintenance = async () => {
  console.log("🧹 Running price history maintenance...");

  const now = new Date();
  const last24H = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const last7D = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const last30D = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const last1Y = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

  try {
    // Check how many records exist before doing anything
    const totalRecords = await prisma.priceHistory.count();
    console.log(`📊 Total price records: ${totalRecords}`);

    // Don't run maintenance if DB is too fresh (less than 100 records)
    if (totalRecords < 100) {
      console.log(
        "⚠️  Not enough records to compress yet, skipping maintenance",
      );
      return;
    }

    // STEP 1: Delete everything older than 1 year
    const deleted = await prisma.priceHistory.deleteMany({
      where: { createdAt: { lt: last1Y } },
    });
    console.log(`🗑️  Deleted ${deleted.count} records older than 1 year`);

    // STEP 2: Compress 7D-30D into hourly averages
    await compressRecords({
      from: last30D,
      to: last7D,
      intervalMinutes: 60,
      label: "7D-30D → hourly",
    });

    // STEP 3: Compress 24H-7D into 5 minute averages
    await compressRecords({
      from: last7D,
      to: last24H,
      intervalMinutes: 5,
      label: "24H-7D → 5min",
    });

    // STEP 4: Keep last 24H untouched
    console.log("✅ Last 24H records kept at full resolution");
    console.log("✅ Price history maintenance complete");
  } catch (error) {
    console.error("Maintenance error:", error);
  }
};

const compressRecords = async ({
  from,
  to,
  intervalMinutes,
  label,
}: {
  from: Date;
  to: Date;
  intervalMinutes: number;
  label: string;
}) => {
  const records = await prisma.priceHistory.findMany({
    where: { createdAt: { gte: from, lt: to } },
    orderBy: { createdAt: "asc" },
  });

  if (records.length === 0) {
    console.log(`⚠️  No records found for ${label}`);
    return;
  }

  const buckets = new Map<string, { prices: number[]; time: Date }>();

  for (const record of records) {
    const bucketTime = new Date(record.createdAt);
    bucketTime.setSeconds(0, 0);
    const minutes = bucketTime.getMinutes();
    const roundedMinutes =
      Math.floor(minutes / intervalMinutes) * intervalMinutes;
    bucketTime.setMinutes(roundedMinutes);
    const key = bucketTime.toISOString();

    if (!buckets.has(key)) {
      buckets.set(key, { prices: [], time: bucketTime });
    }
    buckets.get(key)!.prices.push(record.price);
  }

  const compressed = Array.from(buckets.values()).map((bucket) => ({
    price: parseFloat(
      (bucket.prices.reduce((a, b) => a + b, 0) / bucket.prices.length).toFixed(
        4,
      ),
    ),
    createdAt: bucket.time,
  }));

  await prisma.priceHistory.deleteMany({
    where: { createdAt: { gte: from, lt: to } },
  });

  await prisma.priceHistory.createMany({ data: compressed });

  console.log(
    `✅ ${label}: ${records.length} records → ${compressed.length} averages`,
  );
};

export const startHistoryCleanup = () => {
  console.log("🕐 Price history cleanup scheduled every 24 hours");

  // ❌ Removed: runPriceHistoryMaintenance() on start
  // ✅ Only runs after 24 hours
  setInterval(
    () => {
      runPriceHistoryMaintenance();
    },
    24 * 60 * 60 * 1000,
  );
};
