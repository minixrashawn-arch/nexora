"use client";

import Header from "@/components/code/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowDownCircleIcon,
  ArrowUpCircleIcon,
  WalletIcon,
  BarChart2Icon,
  TrendingUpIcon,
  TrendingDownIcon,
  EyeIcon,
  EyeOffIcon,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { useAppSelector } from "@/state/redux";
import { selectCurrentUser } from "@/state/slice/authSlice";
import {
  useGetBalanceQuery,
  useGetTransactionHistoryQuery,
} from "@/state/api/userApi";
import {
  useGetCurrentPriceQuery,
  useGetPriceHistoryQuery,
} from "@/state/api/priceApi";
import { PriceRange } from "@/state/types";
import { DepositModal } from "./components/Deposit";
import { WithdrawModal } from "./components/Withdrawal";

const RANGES: PriceRange[] = ["24H", "7D", "30D", "90D", "1Y"];

const statusColor = {
  PENDING:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  APPROVED: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  REJECTED: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

export default function Home() {
  const router = useRouter();
  const user = useAppSelector(selectCurrentUser);
  const [showBalance, setShowBalance] = useState(true);
  const [selectedRange, setSelectedRange] = useState<PriceRange>("24H");
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  // Queries
  const { data: balanceData, isLoading: balanceLoading } = useGetBalanceQuery();
  const {
    data: priceData,
    isLoading: priceLoading,
    refetch: refetchPrice,
  } = useGetCurrentPriceQuery(undefined, {
    pollingInterval: 15000,
    skipPollingIfUnfocused: false,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const {
    data: historyData,
    isLoading: historyLoading,
    refetch: refetchHistory,
  } = useGetPriceHistoryQuery(selectedRange, {
    pollingInterval: 15000,
    skipPollingIfUnfocused: false,
  });

  const { data: txData, isLoading: txLoading } =
    useGetTransactionHistoryQuery();

  const balance = balanceData?.data;
  const price = priceData?.data;
  const history = historyData?.data;
  const transactions = txData?.data?.slice(0, 5); // last 5 only

  const pricePositive = (price?.change24h ?? 0) >= 0;

  // Backup interval in case RTK polling misses
  useEffect(() => {
    const interval = setInterval(() => {
      refetchPrice();
    }, 15000);
    return () => clearInterval(interval);
  }, [refetchPrice]);

  useEffect(() => {
    const interval = setInterval(() => {
      refetchHistory();
    }, 15000);
    return () => clearInterval(interval);
  }, [refetchHistory, selectedRange]);

  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6 pb-10">
      <Header title={`Welcome back, ${user?.name?.split(" ")[0] ?? ""}!`} />

      {/* ── Balance Cards ──────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* NEXORA Balance */}
        <Card className="col-span-1 sm:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-green-500">
                <WalletIcon className="size-4 text-white" />
              </div>
              <div>
                <CardTitle className="text-sm font-medium">
                  NEXORA Balance
                </CardTitle>
                <p className="text-xs text-muted-foreground">Available funds</p>
              </div>
            </div>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="text-muted-foreground hover:text-foreground"
            >
              {showBalance ? (
                <EyeIcon className="size-4" />
              ) : (
                <EyeOffIcon className="size-4" />
              )}
            </button>
          </CardHeader>
          <CardContent>
            {balanceLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <p className="text-3xl font-bold text-green-500">
                {showBalance
                  ? `${balance?.nexoraBalance?.toFixed(4) ?? "0.0000"} NEXORA`
                  : "••••••••"}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Portfolio Value */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <div className="p-2 rounded-lg bg-blue-500">
              <BarChart2Icon className="size-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-sm font-medium">
                Portfolio Value
              </CardTitle>
              <p className="text-xs text-muted-foreground">USD Estimate</p>
            </div>
          </CardHeader>
          <CardContent>
            {balanceLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <p className="text-2xl font-bold text-blue-500">
                {showBalance
                  ? `$${balance?.portfolioValue?.toFixed(2) ?? "0.00"} USD`
                  : "••••••"}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Based on current NEXORA price
            </p>
          </CardContent>
        </Card>

        {/* Current Price */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <div className="p-2 rounded-lg bg-yellow-500">
              <TrendingUpIcon className="size-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-sm font-medium">
                Current Price
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Real-time market price
              </p>
            </div>
          </CardHeader>
          <CardContent>
            {priceLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <p className="text-2xl font-bold text-yellow-500">
                ${price?.currentPrice?.toFixed(4) ?? "0.0000"} USD
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Updates every 15 seconds
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Deposit / Withdraw Buttons ─────────────────────── */}
      <div className="flex gap-3">
        <Button
          className="flex-1 sm:flex-none gap-2"
          onClick={() => setDepositOpen(true)}
        >
          <ArrowDownCircleIcon className="size-4" />
          Deposit Funds
        </Button>
        <Button
          variant="outline"
          className="flex-1 sm:flex-none gap-2"
          onClick={() => setWithdrawOpen(true)}
        >
          <ArrowUpCircleIcon className="size-4" />
          Withdraw Funds
        </Button>
      </div>

      {/* ── Market Overview ────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Market Overview</CardTitle>
              <p className="text-sm text-muted-foreground">
                Real-time NEXORA performance
              </p>
            </div>
            {/* Time range filters */}
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

          {/* Market Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
            {[
              {
                label: "Price",
                value: `$${price?.currentPrice?.toFixed(4) ?? "—"}`,
              },
              {
                label: "24H Change",
                value: `${pricePositive ? "+" : ""}${price?.change24h?.toFixed(2) ?? "0"}%`,
                color: pricePositive ? "text-green-500" : "text-red-500",
              },
              {
                label: "Volume",
                value: price?.volume
                  ? `${(price.volume / 1e6).toFixed(2)}M`
                  : "—",
              },
              {
                label: "Market Cap",
                value: price?.marketCap
                  ? `${(price.marketCap / 1e9).toFixed(2)}B`
                  : "—",
              },
            ].map((stat) => (
              <div key={stat.label} className="bg-muted/40 rounded-lg p-3">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  {stat.label}
                </p>
                <div className={`text-lg font-bold mt-1 ${stat.color ?? ""}`}>
                  {priceLoading ? (
                    <Skeleton className="h-6 w-16" />
                  ) : (
                    stat.value
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardHeader>

        <CardContent>
          {historyLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : history?.history?.length ? (
            <ResponsiveContainer width="100%" height={260}>
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
                  width={55}
                />
                <Tooltip
                  // @ts-expect-error "<>"
                  formatter={(value: number) => [`$${value}`, "Price"]}
                  labelFormatter={(label) =>
                    format(new Date(label), "MMM dd, HH:mm")
                  }
                  contentStyle={{
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
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
              No price data available yet
            </div>
          )}

          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-muted-foreground">
              Last updated: {format(new Date(), "hh:mm:ss a")}
            </p>
            <div className="flex items-center gap-1">
              {pricePositive ? (
                <TrendingUpIcon className="size-3 text-green-500" />
              ) : (
                <TrendingDownIcon className="size-3 text-red-500" />
              )}
              <p className="text-xs text-muted-foreground">
                {selectedRange} High: ${history?.high ?? "—"} · Low: $
                {history?.low ?? "—"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Recent Activity ────────────────────────────────── */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Activity</CardTitle>
            <p className="text-sm text-muted-foreground">
              Your latest transactions
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/user/dashboard/transactions")}
          >
            View All
          </Button>
        </CardHeader>
        <CardContent>
          {txLoading ? (
            <div className="flex flex-col gap-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : transactions?.length ? (
            <div className="flex flex-col gap-2">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-full ${
                        tx.type === "DEPOSIT"
                          ? "bg-green-100 dark:bg-green-900"
                          : "bg-red-100 dark:bg-red-900"
                      }`}
                    >
                      {tx.type === "DEPOSIT" ? (
                        <ArrowDownCircleIcon className="size-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <ArrowUpCircleIcon className="size-4 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {tx.type === "DEPOSIT" ? "Deposit" : "Withdrawal"} of{" "}
                        {tx.amount} {tx.currency}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(
                          new Date(tx.createdAt),
                          "MMM dd, yyyy · hh:mm a",
                        )}
                      </p>
                    </div>
                  </div>
                  <Badge className={statusColor[tx.status]}>
                    {tx.status.toLowerCase()}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-24 text-muted-foreground text-sm">
              No transactions yet
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Modals ─────────────────────────────────────────── */}
      <DepositModal open={depositOpen} onClose={() => setDepositOpen(false)} />
      <WithdrawModal
        open={withdrawOpen}
        onClose={() => setWithdrawOpen(false)}
      />
    </div>
  );
}
