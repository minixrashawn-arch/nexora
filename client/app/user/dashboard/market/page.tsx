"use client";

import { useState } from "react";
import { format } from "date-fns";
import Header from "@/components/code/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUpIcon,
  TrendingDownIcon,
  DollarSignIcon,
  BarChart2Icon,
  CoinsIcon,
  ActivityIcon,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { PriceRange } from "@/state/types";
import { useLivePrice } from "@/hooks/livePrice";

const RANGES: PriceRange[] = ["24H", "7D", "30D", "90D", "1Y"];

// Custom tooltip for chart
const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: any[];
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background shadow-lg p-3 text-xs">
        <p className="text-muted-foreground mb-1">
          {label ? format(new Date(label), "MMM dd, HH:mm") : ""}
        </p>
        <p className="font-bold text-base">${payload[0].value.toFixed(4)}</p>
      </div>
    );
  }
  return null;
};

export default function MarketPage() {
  const [selectedRange, setSelectedRange] = useState<PriceRange>("24H");
  const { priceData, historyData, priceLoading, historyLoading } =
    useLivePrice(selectedRange);

  const price = priceData?.data;
  const history = historyData?.data;
  const pricePositive = (price?.change24h ?? 0) >= 0;
  const chartPositive = (history?.change ?? 0) >= 0;

  // Calculate average price for reference line
  const avgPrice = history?.history?.length
    ? history.history.reduce((sum, p) => sum + p.price, 0) /
      history.history.length
    : 0;

  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6 pb-10">
      <Header title="Market" />

      {/* ── Live Price Hero ────────────────────────────────── */}
      <Card className="bg-gradient-to-br from-violet-600 to-purple-700 text-white border-0">
        <CardContent className="pt-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <CoinsIcon className="size-4 text-white" />
                </div>
                <div>
                  <p className="font-bold text-lg leading-none">NEXORA</p>
                  <p className="text-white/70 text-xs">NXR/USD</p>
                </div>
                <Badge className="bg-white/20 text-white border-0 text-xs ml-2">
                  ● Live
                </Badge>
              </div>

              {priceLoading ? (
                <Skeleton className="h-12 w-48 bg-white/20" />
              ) : (
                <p className="text-5xl font-bold tracking-tight">
                  ${price?.currentPrice?.toFixed(4) ?? "—"}
                </p>
              )}

              <div className="flex items-center gap-2 mt-2">
                {pricePositive ? (
                  <TrendingUpIcon className="size-4 text-green-300" />
                ) : (
                  <TrendingDownIcon className="size-4 text-red-300" />
                )}
                <span
                  className={`text-sm font-medium ${
                    pricePositive ? "text-green-300" : "text-red-300"
                  }`}
                >
                  {pricePositive ? "+" : ""}
                  {price?.change24h?.toFixed(2) ?? "0"}% (24H)
                </span>
              </div>
            </div>

            {/* Right side stats */}
            <div className="grid grid-cols-2 gap-3 sm:text-right">
              {[
                {
                  label: "Volume",
                  value: price?.volume
                    ? `$${(price.volume / 1e6).toFixed(2)}M`
                    : "—",
                },
                {
                  label: "Market Cap",
                  value: price?.marketCap
                    ? `$${(price.marketCap / 1e9).toFixed(2)}B`
                    : "—",
                },
                {
                  label: "Total Supply",
                  value: price?.totalSupply
                    ? `${(price.totalSupply / 1e6).toFixed(0)}M`
                    : "—",
                },
                {
                  label: "Updates",
                  value: "Every 15s",
                },
              ].map((stat, index) => (
                <div
                  key={`hero-stat-${index}`}
                  className="bg-white/10 rounded-lg p-3"
                >
                  <p className="text-white/60 text-xs">{stat.label}</p>
                  <p className="text-white font-bold text-sm mt-0.5">
                    {priceLoading ? "—" : stat.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Market Stats ───────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Current Price",
            value: priceLoading
              ? null
              : `$${price?.currentPrice?.toFixed(4) ?? "—"}`,
            icon: DollarSignIcon,
            color: "text-yellow-500",
            bg: "bg-yellow-50 dark:bg-yellow-950",
          },
          {
            label: "24H Change",
            value: priceLoading
              ? null
              : `${pricePositive ? "+" : ""}${price?.change24h?.toFixed(2) ?? "0"}%`,
            icon: pricePositive ? TrendingUpIcon : TrendingDownIcon,
            color: pricePositive ? "text-green-500" : "text-red-500",
            bg: pricePositive
              ? "bg-green-50 dark:bg-green-950"
              : "bg-red-50 dark:bg-red-950",
          },
          {
            label: "Volume",
            value: priceLoading
              ? null
              : price?.volume
                ? `$${(price.volume / 1e6).toFixed(2)}M`
                : "—",
            icon: BarChart2Icon,
            color: "text-blue-500",
            bg: "bg-blue-50 dark:bg-blue-950",
          },
          {
            label: "Market Cap",
            value: priceLoading
              ? null
              : price?.marketCap
                ? `$${(price.marketCap / 1e9).toFixed(2)}B`
                : "—",
            icon: ActivityIcon,
            color: "text-purple-500",
            bg: "bg-purple-50 dark:bg-purple-950",
          },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={`market-stat-${index}`}>
              <CardContent className="flex items-center gap-3 pt-6">
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <Icon className={`size-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  {stat.value === null ? (
                    <Skeleton className="h-7 w-20 mt-1" />
                  ) : (
                    <p className={`text-xl font-bold ${stat.color}`}>
                      {stat.value}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ── Main Chart ─────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>NEXORA / USD</CardTitle>
              <p className="text-sm text-muted-foreground">
                Price chart — powered by Nexora Network
              </p>
            </div>
            {/* Range filters */}
            <div className="flex gap-1 bg-muted/40 p-1 rounded-lg w-fit">
              {RANGES.map((range) => (
                <button
                  key={range}
                  onClick={() => setSelectedRange(range)}
                  className={`px-3 py-1.5 text-xs rounded-md font-medium transition-all ${
                    selectedRange === range
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          {/* Range stats */}
          {history && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              {[
                { label: "Open", value: `$${history.open}` },
                {
                  label: "High",
                  value: `$${history.high}`,
                  color: "text-green-500",
                },
                {
                  label: "Low",
                  value: `$${history.low}`,
                  color: "text-red-500",
                },
                {
                  label: `${selectedRange} Change`,
                  value: `${chartPositive ? "+" : ""}${history.change}%`,
                  color: chartPositive ? "text-green-500" : "text-red-500",
                },
              ].map((s, index) => (
                <div
                  key={`range-stat-${index}`}
                  className="bg-muted/40 rounded-lg p-3"
                >
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    {s.label}
                  </p>
                  <p className={`text-lg font-bold mt-1 ${s.color ?? ""}`}>
                    {s.value}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardHeader>

        <CardContent>
          {historyLoading ? (
            <Skeleton className="h-80 w-full" />
          ) : history?.history?.length ? (
            <ResponsiveContainer width="100%" height={320}>
              <LineChart
                data={history.history}
                margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  opacity={0.4}
                />
                <XAxis
                  dataKey="time"
                  tickFormatter={(t) =>
                    selectedRange === "24H"
                      ? format(new Date(t), "HH:mm")
                      : selectedRange === "7D"
                        ? format(new Date(t), "EEE")
                        : format(new Date(t), "MMM dd")
                  }
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  domain={["auto", "auto"]}
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `$${v}`}
                  width={65}
                />
                <Tooltip content={<CustomTooltip />} />
                {/* Average price reference line */}
                {avgPrice > 0 && (
                  <ReferenceLine
                    y={avgPrice}
                    stroke="hsl(var(--muted-foreground))"
                    strokeDasharray="4 4"
                    strokeOpacity={0.5}
                    label={{
                      value: `Avg $${avgPrice.toFixed(4)}`,
                      position: "insideTopRight",
                      fontSize: 10,
                      fill: "hsl(var(--muted-foreground))",
                    }}
                  />
                )}
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke={chartPositive ? "#22c55e" : "#ef4444"}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{
                    r: 5,
                    fill: chartPositive ? "#22c55e" : "#ef4444",
                    stroke: "hsl(var(--background))",
                    strokeWidth: 2,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-80 text-muted-foreground text-sm">
              No price data available yet
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t">
            <p className="text-xs text-muted-foreground">
              Last updated:{" "}
              <span className="text-foreground font-medium">
                {format(new Date(), "hh:mm:ss a")}
              </span>
            </p>
            <p className="text-xs text-muted-foreground">
              Powered by Nexora Network
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ── Price Info Cards ───────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-3">
              <DollarSignIcon className="size-4 text-yellow-500" />
              <p className="font-semibold text-sm">Price Info</p>
            </div>
            <div className="flex flex-col gap-2">
              {[
                {
                  label: "Current",
                  value: `$${price?.currentPrice?.toFixed(4) ?? "—"}`,
                },
                {
                  label: "Range High",
                  value: history?.high ? `$${history.high}` : "—",
                },
                {
                  label: "Range Low",
                  value: history?.low ? `$${history.low}` : "—",
                },
                {
                  label: "Average",
                  value: avgPrice > 0 ? `$${avgPrice.toFixed(4)}` : "—",
                },
              ].map((row, index) => (
                <div
                  key={`price-info-${index}`}
                  className="flex justify-between text-sm py-1 border-b last:border-0"
                >
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="font-medium">{row.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-3">
              <BarChart2Icon className="size-4 text-blue-500" />
              <p className="font-semibold text-sm">Market Info</p>
            </div>
            <div className="flex flex-col gap-2">
              {[
                {
                  label: "Market Cap",
                  value: price?.marketCap
                    ? `$${(price.marketCap / 1e9).toFixed(2)}B`
                    : "—",
                },
                {
                  label: "Volume (24H)",
                  value: price?.volume
                    ? `$${(price.volume / 1e6).toFixed(2)}M`
                    : "—",
                },
                {
                  label: "Total Supply",
                  value: price?.totalSupply
                    ? `${(price.totalSupply / 1e6).toFixed(0)}M NXR`
                    : "—",
                },
                {
                  label: "Circulating",
                  value: price?.totalSupply
                    ? `${(price.totalSupply / 1e6).toFixed(0)}M NXR`
                    : "—",
                },
              ].map((row, index) => (
                <div
                  key={`market-info-${index}`}
                  className="flex justify-between text-sm py-1 border-b last:border-0"
                >
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="font-medium">{row.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-3">
              <ActivityIcon className="size-4 text-purple-500" />
              <p className="font-semibold text-sm">Performance</p>
            </div>
            <div className="flex flex-col gap-2">
              {[
                {
                  label: "24H Change",
                  value: `${pricePositive ? "+" : ""}${price?.change24h?.toFixed(2) ?? "0"}%`,
                  color: pricePositive ? "text-green-500" : "text-red-500",
                },
                {
                  label: `${selectedRange} Change`,
                  value: `${chartPositive ? "+" : ""}${history?.change?.toFixed(2) ?? "0"}%`,
                  color: chartPositive ? "text-green-500" : "text-red-500",
                },
                {
                  label: `${selectedRange} High`,
                  value: history?.high ? `$${history.high}` : "—",
                  color: "text-green-500",
                },
                {
                  label: `${selectedRange} Low`,
                  value: history?.low ? `$${history.low}` : "—",
                  color: "text-red-500",
                },
              ].map((row, index) => (
                <div
                  key={`perf-${index}`}
                  className="flex justify-between text-sm py-1 border-b last:border-0"
                >
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className={`font-medium ${row.color ?? ""}`}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
