"use client";

import { useState } from "react";
import { format } from "date-fns";
import Header from "@/components/code/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  ArrowDownCircleIcon,
  ArrowUpCircleIcon,
  SearchIcon,
  EyeIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  WalletIcon,
} from "lucide-react";
import { Transaction, TransactionStatus, TransactionType } from "@/state/types";
import { useGetTransactionHistoryQuery } from "@/state/api/userApi";
import { useGetCurrentPriceQuery } from "@/state/api/priceApi";
import { DepositModal } from "../home/components/Deposit";
import { WithdrawModal } from "../home/components/Withdrawal";

const statusColor: Record<TransactionStatus, string> = {
  PENDING:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  APPROVED: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  REJECTED: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

type FilterType = TransactionType | "ALL";
type FilterStatus = TransactionStatus | "ALL";

export default function TransactionsPage() {
  const [typeFilter, setTypeFilter] = useState<FilterType>("ALL");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("ALL");
  const [search, setSearch] = useState("");
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  const { data, isLoading } = useGetTransactionHistoryQuery();
  const { data: priceData } = useGetCurrentPriceQuery();

  const transactions = data?.data ?? [];
  const currentPrice = priceData?.data?.currentPrice ?? 0;

  // Filter
  const filtered = transactions.filter((tx) => {
    const q = search.toLowerCase();
    const matchesSearch =
      tx.currency.toLowerCase().includes(q) ||
      tx.txHash?.toLowerCase().includes(q) ||
      tx.id.toLowerCase().includes(q) ||
      tx.amount.toString().includes(q);

    const matchesType = typeFilter === "ALL" ? true : tx.type === typeFilter;

    const matchesStatus =
      statusFilter === "ALL" ? true : tx.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  // Stats
  const totalDeposited = transactions
    .filter((t) => t.type === "DEPOSIT" && t.status === "APPROVED")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalWithdrawn = transactions
    .filter((t) => t.type === "WITHDRAWAL" && t.status === "APPROVED")
    .reduce((sum, t) => sum + t.amount, 0);

  const pending = transactions.filter((t) => t.status === "PENDING").length;
  const totalNexora = transactions
    .filter((t) => t.type === "DEPOSIT" && t.status === "APPROVED")
    .reduce((sum, t) => sum + (t.nexoraAmount ?? 0), 0);

  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6 pb-10">
      <Header title="Transactions" />

      {/* ── Stats ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Deposited",
            value: `$${totalDeposited.toFixed(2)}`,
            icon: ArrowDownCircleIcon,
            color: "text-green-500",
            bg: "bg-green-50 dark:bg-green-950",
          },
          {
            label: "Total Withdrawn",
            value: `$${totalWithdrawn.toFixed(2)}`,
            icon: ArrowUpCircleIcon,
            color: "text-red-500",
            bg: "bg-red-50 dark:bg-red-950",
          },
          {
            label: "Pending",
            value: pending,
            icon: ClockIcon,
            color: "text-yellow-500",
            bg: "bg-yellow-50 dark:bg-yellow-950",
          },
          {
            label: "NEXORA Received",
            value: totalNexora.toFixed(4),
            icon: WalletIcon,
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
                  <p className={`text-xl font-bold ${stat.color}`}>
                    {stat.value}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ── Action Buttons ─────────────────────────────────── */}
      <div className="flex gap-3">
        <Button className="gap-2" onClick={() => setDepositOpen(true)}>
          <ArrowDownCircleIcon className="size-4" />
          Deposit Funds
        </Button>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => setWithdrawOpen(true)}
        >
          <ArrowUpCircleIcon className="size-4" />
          Withdraw Funds
        </Button>
      </div>

      {/* ── Table ──────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle>Transaction History</CardTitle>
            <div className="flex flex-wrap gap-2">
              {/* Search */}
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search amount, currency, hash..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 w-56"
                />
              </div>
              {/* Type filter */}
              <Select
                value={typeFilter}
                onValueChange={(val) => setTypeFilter(val as FilterType)}
              >
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Types</SelectItem>
                  <SelectItem value="DEPOSIT">Deposits</SelectItem>
                  <SelectItem value="WITHDRAWAL">Withdrawals</SelectItem>
                </SelectContent>
              </Select>
              {/* Status filter */}
              <Select
                value={statusFilter}
                onValueChange={(val) => setStatusFilter(val as FilterStatus)}
              >
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col gap-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-3 text-muted-foreground">
              <WalletIcon className="size-10 opacity-20" />
              <p className="text-sm">No transactions found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Currency</TableHead>
                    <TableHead>NEXORA</TableHead>
                    <TableHead>USD Value</TableHead>
                    <TableHead>Tx Hash</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className={`p-1.5 rounded-full ${
                              tx.type === "DEPOSIT"
                                ? "bg-green-100 dark:bg-green-900"
                                : "bg-red-100 dark:bg-red-900"
                            }`}
                          >
                            {tx.type === "DEPOSIT" ? (
                              <ArrowDownCircleIcon className="size-3 text-green-600 dark:text-green-400" />
                            ) : (
                              <ArrowUpCircleIcon className="size-3 text-red-600 dark:text-red-400" />
                            )}
                          </div>
                          <span className="text-sm font-medium capitalize">
                            {tx.type.toLowerCase()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-sm">
                        {tx.amount}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{tx.currency}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {tx.nexoraAmount?.toFixed(4) ?? "—"}
                      </TableCell>
                      <TableCell className="text-blue-500 text-sm">
                        ${((tx.nexoraAmount ?? 0) * currentPrice).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {tx.txHash ? (
                          <span className="font-mono text-xs">
                            {tx.txHash.slice(0, 12)}...
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-xs">
                            —
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {format(new Date(tx.createdAt), "MMM dd, yyyy")}
                        <br />
                        {format(new Date(tx.createdAt), "hh:mm a")}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColor[tx.status]}>
                          {tx.status === "PENDING" && (
                            <ClockIcon className="size-3 mr-1" />
                          )}
                          {tx.status === "APPROVED" && (
                            <CheckCircleIcon className="size-3 mr-1" />
                          )}
                          {tx.status === "REJECTED" && (
                            <XCircleIcon className="size-3 mr-1" />
                          )}
                          {tx.status.toLowerCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            setSelectedTx(tx);
                            setDetailOpen(true);
                          }}
                        >
                          <EyeIcon className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Results count */}
          {!isLoading && filtered.length > 0 && (
            <p className="text-xs text-muted-foreground mt-4">
              Showing {filtered.length} of {transactions.length} transactions
            </p>
          )}
        </CardContent>
      </Card>

      {/* ── Detail Modal ───────────────────────────────────── */}
      {selectedTx && (
        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Transaction Details</DialogTitle>
              <DialogDescription>
                Full information for this transaction
              </DialogDescription>
            </DialogHeader>

            {/* Type badge */}
            <div className="flex items-center gap-3 py-2">
              <div
                className={`p-2 rounded-full ${
                  selectedTx.type === "DEPOSIT"
                    ? "bg-green-100 dark:bg-green-900"
                    : "bg-red-100 dark:bg-red-900"
                }`}
              >
                {selectedTx.type === "DEPOSIT" ? (
                  <ArrowDownCircleIcon className="size-5 text-green-600 dark:text-green-400" />
                ) : (
                  <ArrowUpCircleIcon className="size-5 text-red-600 dark:text-red-400" />
                )}
              </div>
              <div>
                <p className="font-semibold capitalize">
                  {selectedTx.type.toLowerCase()}
                </p>
                <Badge className={statusColor[selectedTx.status]}>
                  {selectedTx.status.toLowerCase()}
                </Badge>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              {[
                { label: "Transaction ID", value: selectedTx.id },
                {
                  label: "Amount",
                  value: `${selectedTx.amount} ${selectedTx.currency}`,
                },
                {
                  label: "NEXORA",
                  value: selectedTx.nexoraAmount
                    ? `${selectedTx.nexoraAmount.toFixed(4)} NEXORA`
                    : "—",
                },
                {
                  label: "USD Value",
                  value: `$${(
                    (selectedTx.nexoraAmount ?? 0) * currentPrice
                  ).toFixed(2)}`,
                },
                { label: "Currency", value: selectedTx.currency },
                {
                  label: "Tx Hash",
                  value: selectedTx.txHash || "Not provided",
                },
                selectedTx.type === "WITHDRAWAL"
                  ? {
                      label: "Wallet Address",
                      value: selectedTx.walletAddress || "—",
                    }
                  : null,
                {
                  label: "Date",
                  value: format(
                    new Date(selectedTx.createdAt),
                    "MMM dd, yyyy · hh:mm a",
                  ),
                },
                { label: "Status", value: selectedTx.status },
              ]
                .filter(Boolean)
                .map((row) => (
                  <div
                    key={row!.label}
                    className="flex justify-between items-start py-2 border-b last:border-0"
                  >
                    <p className="text-sm text-muted-foreground shrink-0">
                      {row!.label}
                    </p>
                    <p className="text-sm font-medium text-right max-w-52 break-all">
                      {row!.value}
                    </p>
                  </div>
                ))}
            </div>

            {/* Status messages */}
            {selectedTx.status === "PENDING" && (
              <div className="rounded-lg bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 p-3">
                <p className="text-xs text-yellow-700 dark:text-yellow-300">
                  ⏳ Your{" "}
                  {selectedTx.type === "DEPOSIT" ? "deposit" : "withdrawal"} is
                  pending admin review. This usually takes a few hours.
                </p>
              </div>
            )}
            {selectedTx.status === "APPROVED" && (
              <div className="rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 p-3">
                <p className="text-xs text-green-700 dark:text-green-300">
                  ✅ This{" "}
                  {selectedTx.type === "DEPOSIT" ? "deposit" : "withdrawal"} has
                  been approved and processed successfully.
                </p>
              </div>
            )}
            {selectedTx.status === "REJECTED" && (
              <div className="rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 p-3">
                <p className="text-xs text-red-700 dark:text-red-300">
                  ❌ This transaction was rejected. Please contact support if
                  you believe this is an error.
                </p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}

      {/* ── Modals ─────────────────────────────────────────── */}
      <DepositModal open={depositOpen} onClose={() => setDepositOpen(false)} />
      <WithdrawModal
        open={withdrawOpen}
        onClose={() => setWithdrawOpen(false)}
      />
    </div>
  );
}
