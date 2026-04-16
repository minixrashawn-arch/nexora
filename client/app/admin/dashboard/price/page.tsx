"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import Header from "@/components/code/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  TrendingUpIcon,
  TrendingDownIcon,
  DollarSignIcon,
  BarChart2Icon,
  Loader2,
  RefreshCwIcon,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { PriceRange } from "@/state/types";
import { useLivePrice } from "@/hooks/livePrice";
import {
  useGetSiteSettingsQuery,
  useUpdatePriceMutation,
} from "@/state/api/adminApi";

const RANGES: PriceRange[] = ["24H", "7D", "30D", "90D", "1Y"];

export default function AdminPricePage() {
  const [newPrice, setNewPrice] = useState("");
  const [selectedRange, setSelectedRange] = useState<PriceRange>("24H");
  const [priceHistory, setPriceHistory] = useState<
    { price: number; time: string }[]
  >([]);

  const { priceData, historyData, priceLoading, historyLoading } =
    useLivePrice(selectedRange);
  const { data: settingsData } = useGetSiteSettingsQuery();
  const [updatePrice, { isLoading: updating }] = useUpdatePriceMutation();

  const price = priceData?.data;
  const history = historyData?.data;
  const settings = settingsData?.data;

  const pricePositive = (price?.change24h ?? 0) >= 0;

  // Keep a local log of price changes during this session
  React.useEffect(() => {
    if (price?.currentPrice) {
      setPriceHistory((prev) => {
        const entry = {
          price: price.currentPrice,
          time: new Date().toISOString(),
        };
        // Keep last 20 entries
        return [...prev.slice(-19), entry];
      });
    }
  }, [price?.currentPrice]);

  const handleUpdatePrice = async () => {
    const parsed = parseFloat(newPrice);
    if (!newPrice || isNaN(parsed) || parsed <= 0) {
      toast.error("Enter a valid price greater than 0");
      return;
    }

    try {
      await updatePrice({ price: parsed }).unwrap();
      toast.success(`NEXORA price updated to $${parsed.toFixed(4)}`);
      setNewPrice("");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update price");
    }
  };

  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6 pb-10">
      <Header title="Price Control" />

      {/* ── Stats ──────────────────────────────────────────── */}
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
            label: "Market Cap",
            value: priceLoading
              ? null
              : price?.marketCap
                ? `$${(price.marketCap / 1e9).toFixed(2)}B`
                : "—",
            icon: BarChart2Icon,
            color: "text-blue-500",
            bg: "bg-blue-50 dark:bg-blue-950",
          },
          {
            label: "Total Supply",
            value: settings?.totalSupply
              ? `${(settings.totalSupply / 1e6).toFixed(0)}M`
              : "—",
            icon: RefreshCwIcon,
            color: "text-purple-500",
            bg: "bg-purple-50 dark:bg-purple-950",
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="flex items-center gap-3 pt-6">
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <Icon className={`size-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  {stat.value === null ? (
                    <Skeleton className="h-6 w-20 mt-1" />
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Set Price Form ──────────────────────────────── */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Set NEXORA Price</CardTitle>
            <p className="text-sm text-muted-foreground">
              Manually update the base price. The simulator will fluctuate
              around this value.
            </p>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            {/* Current price display */}
            <div className="rounded-lg bg-muted/40 p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">
                Current Price
              </p>
              {priceLoading ? (
                <Skeleton className="h-10 w-32 mx-auto" />
              ) : (
                <p className="text-4xl font-bold text-yellow-500">
                  ${price?.currentPrice?.toFixed(4) ?? "—"}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Updates every 15 seconds
              </p>
            </div>

            {/* New price input */}
            <div className="space-y-2">
              <Label>New Price (USD)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  type="number"
                  placeholder="0.0000"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="pl-7"
                  min="0"
                  step="0.0001"
                />
              </div>
              {newPrice && !isNaN(parseFloat(newPrice)) && (
                <p className="text-xs text-muted-foreground">
                  Market cap will be:{" "}
                  <span className="font-medium text-foreground">
                    $
                    {(
                      parseFloat(newPrice) * (settings?.totalSupply ?? 0)
                    ).toLocaleString()}
                  </span>
                </p>
              )}
            </div>

            {/* Quick set buttons */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">
                Quick adjust
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "-5%", factor: 0.95 },
                  { label: "-1%", factor: 0.99 },
                  { label: "+1%", factor: 1.01 },
                  { label: "+5%", factor: 1.05 },
                  { label: "+10%", factor: 1.1 },
                  { label: "+20%", factor: 1.2 },
                ].map((btn) => (
                  <Button
                    key={btn.label}
                    variant="outline"
                    size="sm"
                    className={
                      btn.factor < 1
                        ? "text-red-500 border-red-200 hover:bg-red-50 dark:hover:bg-red-950"
                        : "text-green-500 border-green-200 hover:bg-green-50 dark:hover:bg-green-950"
                    }
                    onClick={() => {
                      const base = price?.currentPrice ?? 0;
                      const adjusted = (base * btn.factor).toFixed(4);
                      setNewPrice(adjusted);
                    }}
                  >
                    {btn.label}
                  </Button>
                ))}
              </div>
            </div>

            <Button
              className="w-full"
              onClick={handleUpdatePrice}
              disabled={updating || !newPrice}
            >
              {updating ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                "Update Price"
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              ⚠️ Updating price saves to price history and affects all user
              portfolio values instantly.
            </p>
          </CardContent>
        </Card>

        {/* ── Live Chart ─────────────────────────────────── */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle>Price Chart</CardTitle>
                <p className="text-sm text-muted-foreground">
                  NEXORA/USD live performance
                </p>
              </div>
              <div className="flex gap-1">
                {RANGES.map((range) => (
                  <button
                    key={range}
                    onClick={() => setSelectedRange(range)}
                    className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${
                      selectedRange === range
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {historyLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : history?.history?.length ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={history.history}>
                  <XAxis
                    dataKey="time"
                    tickFormatter={(t) =>
                      selectedRange === "24H"
                        ? format(new Date(t), "HH:mm")
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
                    width={60}
                  />
                  <Tooltip
                    // @ts-expect-error "<>"
                    formatter={(value: number) => [`$${value}`, "Price"]}
                    labelFormatter={(label) =>
                      format(new Date(label), "MMM dd, HH:mm")
                    }
                    contentStyle={{ borderRadius: "8px", fontSize: "12px" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
                No price data yet
              </div>
            )}

            {/* Range stats */}
            {history && (
              <div className="grid grid-cols-4 gap-2 mt-4">
                {[
                  { label: "Open", value: `$${history.open}` },
                  { label: "High", value: `$${history.high}` },
                  { label: "Low", value: `$${history.low}` },
                  {
                    label: "Change",
                    value: `${history.change >= 0 ? "+" : ""}${history.change}%`,
                    color:
                      history.change >= 0 ? "text-green-500" : "text-red-500",
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="bg-muted/40 rounded-lg p-2 text-center"
                  >
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                    <p className={`text-sm font-bold ${s.color ?? ""}`}>
                      {s.value}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Session Price Log ──────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Session Price Log</CardTitle>
          <p className="text-sm text-muted-foreground">
            Price changes recorded since you opened this page
          </p>
        </CardHeader>
        <CardContent>
          {priceHistory.length === 0 ? (
            <div className="flex items-center justify-center h-20 text-muted-foreground text-sm">
              Waiting for price updates...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Change</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...priceHistory].reverse().map((entry, index, arr) => {
                    const prev = arr[index + 1];
                    const change = prev
                      ? parseFloat(
                          (
                            ((entry.price - prev.price) / prev.price) *
                            100
                          ).toFixed(4),
                        )
                      : null;
                    return (
                      <TableRow key={entry.time}>
                        <TableCell className="text-muted-foreground text-xs">
                          {priceHistory.length - index}
                        </TableCell>
                        <TableCell className="font-mono font-medium">
                          ${entry.price}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {format(new Date(entry.time), "hh:mm:ss a")}
                        </TableCell>
                        <TableCell>
                          {change !== null ? (
                            <span
                              className={
                                change >= 0 ? "text-green-500" : "text-red-500"
                              }
                            >
                              {change >= 0 ? "+" : ""}
                              {change}%
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-xs">
                              —
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
