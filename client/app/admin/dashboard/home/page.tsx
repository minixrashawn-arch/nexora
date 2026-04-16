"use client";

import { format } from "date-fns";
import Header from "@/components/code/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  UsersIcon,
  ArrowDownCircleIcon,
  ArrowUpCircleIcon,
  ClockIcon,
  TrendingUpIcon,
  DollarSignIcon,
  BarChart2Icon,
  WalletIcon,
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
import { TransactionStatus } from "@/state/types";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/state/redux";
import { selectCurrentUser } from "@/state/slice/authSlice";
import { useLivePrice } from "@/hooks/livePrice";
import {
  useGetAllDepositsQuery,
  useGetAllWithdrawalsQuery,
  useGetOverviewStatsQuery,
} from "@/state/api/adminApi";

const statusColor: Record<TransactionStatus, string> = {
  PENDING:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  APPROVED: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  REJECTED: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

export default function AdminOverviewPage() {
  const router = useRouter();
  const user = useAppSelector(selectCurrentUser);
  const { priceData, historyData, priceLoading, historyLoading } =
    useLivePrice("24H");

  const { data: statsData, isLoading: statsLoading } =
    useGetOverviewStatsQuery();
  const { data: depositsData, isLoading: depositsLoading } =
    useGetAllDepositsQuery("PENDING");
  const { data: withdrawalsData, isLoading: withdrawalsLoading } =
    useGetAllWithdrawalsQuery("PENDING");

  const stats = statsData?.data;
  const price = priceData?.data;
  const history = historyData?.data;
  const pendingDeposits = depositsData?.data?.slice(0, 5) ?? [];
  const pendingWithdrawals = withdrawalsData?.data?.slice(0, 5) ?? [];
  const pricePositive = (price?.change24h ?? 0) >= 0;

  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6 pb-10">
      <Header title={`Welcome, ${user?.name?.split(" ")[0] ?? "Admin"}!`} />

      {/* ── Top Stats ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Users",
            value: stats?.totalUsers ?? 0,
            icon: UsersIcon,
            color: "text-blue-500",
            bg: "bg-blue-50 dark:bg-blue-950",
            href: "/admin/dashboard/users",
          },
          {
            label: "Pending Deposits",
            value: stats?.pendingDeposits ?? 0,
            icon: ArrowDownCircleIcon,
            color: "text-yellow-500",
            bg: "bg-yellow-50 dark:bg-yellow-950",
            href: "/admin/dashboard/deposits",
          },
          {
            label: "Pending Withdrawals",
            value: stats?.pendingWithdrawals ?? 0,
            icon: ArrowUpCircleIcon,
            color: "text-orange-500",
            bg: "bg-orange-50 dark:bg-orange-950",
            href: "/admin/dashboard/withdrawals",
          },
          {
            label: "Current Price",
            value: priceLoading
              ? null
              : `$${price?.currentPrice?.toFixed(4) ?? "—"}`,
            icon: DollarSignIcon,
            color: "text-green-500",
            bg: "bg-green-50 dark:bg-green-950",
            href: "/admin/dashboard/price",
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.label}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => router.push(stat.href)}
            >
              <CardContent className="flex items-center gap-3 pt-6">
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <Icon className={`size-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  {statsLoading || stat.value === null ? (
                    <Skeleton className="h-7 w-16 mt-1" />
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

      {/* ── Secondary Stats ────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Deposits",
            value: statsLoading
              ? null
              : `$${stats?.totalDeposits.amount.toFixed(2) ?? "0"}`,
            sub: `${stats?.totalDeposits.count ?? 0} transactions`,
            icon: ArrowDownCircleIcon,
            color: "text-green-600",
          },
          {
            label: "Total Withdrawals",
            value: statsLoading
              ? null
              : `$${stats?.totalWithdrawals.amount.toFixed(2) ?? "0"}`,
            sub: `${stats?.totalWithdrawals.count ?? 0} transactions`,
            icon: ArrowUpCircleIcon,
            color: "text-red-500",
          },
          {
            label: "24H Change",
            value: priceLoading
              ? null
              : `${pricePositive ? "+" : ""}${price?.change24h?.toFixed(2) ?? "0"}%`,
            sub: "Price movement",
            icon: TrendingUpIcon,
            color: pricePositive ? "text-green-500" : "text-red-500",
          },
          {
            label: "Market Cap",
            value: priceLoading
              ? null
              : price?.marketCap
                ? `$${(price.marketCap / 1e9).toFixed(2)}B`
                : "—",
            sub: "Based on total supply",
            icon: BarChart2Icon,
            color: "text-purple-500",
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`size-4 ${stat.color}`} />
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
                {stat.value === null ? (
                  <Skeleton className="h-7 w-24 mb-1" />
                ) : (
                  <p className={`text-2xl font-bold ${stat.color}`}>
                    {stat.value}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ── Alerts ─────────────────────────────────────────── */}
      {(stats?.pendingDeposits ?? 0) > 0 ||
      (stats?.pendingWithdrawals ?? 0) > 0 ? (
        <div className="flex flex-col sm:flex-row gap-3">
          {(stats?.pendingDeposits ?? 0) > 0 && (
            <div
              className="flex-1 rounded-lg border border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800 p-4 flex items-center justify-between gap-3 cursor-pointer hover:opacity-90"
              onClick={() => router.push("/admin/dashboard/deposits")}
            >
              <div className="flex items-center gap-3">
                <ClockIcon className="size-5 text-yellow-600 dark:text-yellow-400 shrink-0" />
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  <span className="font-semibold">
                    {stats?.pendingDeposits} deposit
                    {stats?.pendingDeposits !== 1 ? "s" : ""}
                  </span>{" "}
                  waiting for approval
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="shrink-0 text-yellow-700 border-yellow-300"
              >
                Review
              </Button>
            </div>
          )}
          {(stats?.pendingWithdrawals ?? 0) > 0 && (
            <div
              className="flex-1 rounded-lg border border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-800 p-4 flex items-center justify-between gap-3 cursor-pointer hover:opacity-90"
              onClick={() => router.push("/admin/dashboard/withdrawals")}
            >
              <div className="flex items-center gap-3">
                <ClockIcon className="size-5 text-orange-600 dark:text-orange-400 shrink-0" />
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  <span className="font-semibold">
                    {stats?.pendingWithdrawals} withdrawal
                    {stats?.pendingWithdrawals !== 1 ? "s" : ""}
                  </span>{" "}
                  waiting for approval
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="shrink-0 text-orange-700 border-orange-300"
              >
                Review
              </Button>
            </div>
          )}
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Price Chart ─────────────────────────────────── */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Price Overview</CardTitle>
              <p className="text-sm text-muted-foreground">
                NEXORA/USD — Last 24 hours
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/admin/dashboard/price")}
            >
              Manage Price
            </Button>
          </CardHeader>
          <CardContent>
            {historyLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : history?.history?.length ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={history.history}>
                  <XAxis
                    dataKey="time"
                    tickFormatter={(t) => format(new Date(t), "HH:mm")}
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    domain={["auto", "auto"]}
                    tick={{ fontSize: 10 }}
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
              <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
                No price data yet
              </div>
            )}

            {/* Price stats row */}
            <div className="grid grid-cols-4 gap-2 mt-4">
              {[
                {
                  label: "Current",
                  value: `$${price?.currentPrice?.toFixed(4) ?? "—"}`,
                },
                { label: "High", value: `$${history?.high ?? "—"}` },
                { label: "Low", value: `$${history?.low ?? "—"}` },
                {
                  label: "Change",
                  value: `${pricePositive ? "+" : ""}${history?.change ?? 0}%`,
                  color: pricePositive ? "text-green-500" : "text-red-500",
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
          </CardContent>
        </Card>

        {/* ── Quick Actions ────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <p className="text-sm text-muted-foreground">
              Navigate to key areas
            </p>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {[
              {
                label: "Review Deposits",
                icon: ArrowDownCircleIcon,
                href: "/admin/dashboard/deposits",
                color: "text-green-600",
                count: stats?.pendingDeposits,
              },
              {
                label: "Review Withdrawals",
                icon: ArrowUpCircleIcon,
                href: "/admin/dashboard/withdrawals",
                color: "text-red-500",
                count: stats?.pendingWithdrawals,
              },
              {
                label: "Manage Users",
                icon: UsersIcon,
                href: "/admin/dashboard/users",
                color: "text-blue-500",
                count: stats?.totalUsers,
              },
              {
                label: "Update Price",
                icon: TrendingUpIcon,
                href: "/admin/dashboard/price",
                color: "text-yellow-500",
              },
              {
                label: "Update Wallets",
                icon: WalletIcon,
                href: "/admin/dashboard/wallets",
                color: "text-purple-500",
              },
              {
                label: "Site Settings",
                icon: RefreshCwIcon,
                href: "/admin/dashboard/settings",
                color: "text-orange-500",
              },
            ].map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  onClick={() => router.push(action.href)}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/60 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`size-4 ${action.color}`} />
                    <span className="text-sm font-medium">{action.label}</span>
                  </div>
                  {action.count !== undefined && (
                    <Badge
                      className={
                        action.count > 0
                          ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                          : "bg-muted text-muted-foreground"
                      }
                    >
                      {action.count}
                    </Badge>
                  )}
                </button>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* ── Pending Deposits Table ─────────────────────────── */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Pending Deposits</CardTitle>
            <p className="text-sm text-muted-foreground">
              Latest deposit requests awaiting approval
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/admin/dashboard/deposits")}
          >
            View All
          </Button>
        </CardHeader>
        <CardContent>
          {depositsLoading ? (
            <div className="flex flex-col gap-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : pendingDeposits.length === 0 ? (
            <div className="flex items-center justify-center h-20 text-muted-foreground text-sm">
              No pending deposits
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>NEXORA</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingDeposits.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{tx.user?.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {tx.user?.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-sm">
                        {tx.amount} {tx.currency}
                      </TableCell>
                      <TableCell className="text-sm">
                        {tx.nexoraAmount?.toFixed(4)} NXR
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {format(new Date(tx.createdAt), "MMM dd, hh:mm a")}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColor[tx.status]}>
                          {tx.status.toLowerCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            router.push("/admin/dashboard/deposits")
                          }
                        >
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Pending Withdrawals Table ──────────────────────── */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Pending Withdrawals</CardTitle>
            <p className="text-sm text-muted-foreground">
              Latest withdrawal requests awaiting approval
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/admin/dashboard/withdrawals")}
          >
            View All
          </Button>
        </CardHeader>
        <CardContent>
          {withdrawalsLoading ? (
            <div className="flex flex-col gap-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : pendingWithdrawals.length === 0 ? (
            <div className="flex items-center justify-center h-20 text-muted-foreground text-sm">
              No pending withdrawals
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>NEXORA</TableHead>
                    <TableHead>Wallet</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingWithdrawals.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{tx.user?.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {tx.user?.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-sm">
                        {tx.amount} {tx.currency}
                      </TableCell>
                      <TableCell className="text-sm">
                        {tx.nexoraAmount?.toFixed(4)} NXR
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {tx.walletAddress
                          ? `${tx.walletAddress.slice(0, 10)}...`
                          : "—"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {format(new Date(tx.createdAt), "MMM dd, hh:mm a")}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColor[tx.status]}>
                          {tx.status.toLowerCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            router.push("/admin/dashboard/withdrawals")
                          }
                        >
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
