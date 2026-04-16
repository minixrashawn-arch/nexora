"use client";

import { useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import Header from "@/components/code/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DialogFooter,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircleIcon,
  XCircleIcon,
  SearchIcon,
  EyeIcon,
  ArrowUpCircleIcon,
  ClockIcon,
  Copy,
  CheckIcon,
} from "lucide-react";
import { Transaction, TransactionStatus } from "@/state/types";
import {
  useApproveWithdrawalMutation,
  useGetAllWithdrawalsQuery,
  useRejectWithdrawalMutation,
} from "@/state/api/adminApi";

const statusColor: Record<TransactionStatus, string> = {
  PENDING:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  APPROVED: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  REJECTED: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

export default function AdminWithdrawalsPage() {
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | "ALL">(
    "ALL",
  );
  const [search, setSearch] = useState("");
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<
    "APPROVE" | "REJECT" | null
  >(null);
  const [confirmTx, setConfirmTx] = useState<Transaction | null>(null);
  const [copied, setCopied] = useState(false);

  const { data, isLoading, refetch } = useGetAllWithdrawalsQuery(
    statusFilter === "ALL" ? undefined : statusFilter,
  );
  const [approveWithdrawal, { isLoading: approving }] =
    useApproveWithdrawalMutation();
  const [rejectWithdrawal, { isLoading: rejecting }] =
    useRejectWithdrawalMutation();

  const withdrawals = data?.data ?? [];

  const filtered = withdrawals.filter((tx) => {
    const q = search.toLowerCase();
    return (
      tx.user?.name?.toLowerCase().includes(q) ||
      tx.user?.email?.toLowerCase().includes(q) ||
      tx.currency.toLowerCase().includes(q) ||
      tx.walletAddress?.toLowerCase().includes(q) ||
      tx.id.toLowerCase().includes(q)
    );
  });

  // Stats
  const pending = withdrawals.filter((t) => t.status === "PENDING").length;
  const approved = withdrawals.filter((t) => t.status === "APPROVED").length;
  const rejected = withdrawals.filter((t) => t.status === "REJECTED").length;
  const totalPaid = withdrawals
    .filter((t) => t.status === "APPROVED")
    .reduce((sum, t) => sum + t.amount, 0);

  const handleCopyWallet = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApprove = async () => {
    if (!confirmTx) return;
    try {
      await approveWithdrawal(confirmTx.id).unwrap();
      toast.success(
        `Withdrawal approved. Remember to send ${confirmTx.amount} ${confirmTx.currency} to ${confirmTx.walletAddress}`,
      );
      setConfirmAction(null);
      setConfirmTx(null);
      setDetailOpen(false);
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to approve withdrawal");
    }
  };

  const handleReject = async () => {
    if (!confirmTx) return;
    try {
      await rejectWithdrawal(confirmTx.id).unwrap();
      toast.success("Withdrawal rejected — NEXORA refunded to user");
      setConfirmAction(null);
      setConfirmTx(null);
      setDetailOpen(false);
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to reject withdrawal");
    }
  };

  const openDetail = (tx: Transaction) => {
    setSelectedTx(tx);
    setDetailOpen(true);
  };

  const openConfirm = (tx: Transaction, action: "APPROVE" | "REJECT") => {
    setConfirmTx(tx);
    setConfirmAction(action);
  };

  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6 pb-10">
      <Header title="Withdrawals" />

      {/* ── Stats ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Pending",
            value: pending,
            icon: ClockIcon,
            color: "text-yellow-500",
            bg: "bg-yellow-50 dark:bg-yellow-950",
          },
          {
            label: "Approved",
            value: approved,
            icon: CheckCircleIcon,
            color: "text-green-500",
            bg: "bg-green-50 dark:bg-green-950",
          },
          {
            label: "Rejected",
            value: rejected,
            icon: XCircleIcon,
            color: "text-red-500",
            bg: "bg-red-50 dark:bg-red-950",
          },
          {
            label: "Total Paid Out",
            value: `$${totalPaid.toFixed(2)}`,
            icon: ArrowUpCircleIcon,
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

      {/* ── Pending Alert ──────────────────────────────────── */}
      {pending > 0 && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800 p-4 flex items-center gap-3">
          <ClockIcon className="size-5 text-yellow-600 dark:text-yellow-400 shrink-0" />
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            <span className="font-semibold">
              {pending} withdrawal{pending > 1 ? "s" : ""} pending.
            </span>{" "}
            Review and send crypto manually before approving.
          </p>
        </div>
      )}

      {/* ── Table ──────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle>All Withdrawals</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search user, currency, wallet..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={(val) =>
                  setStatusFilter(val as TransactionStatus | "ALL")
                }
              >
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All</SelectItem>
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
            <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
              No withdrawals found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Currency</TableHead>
                    <TableHead>NEXORA Deducted</TableHead>
                    <TableHead>Wallet Address</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{tx.user?.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {tx.user?.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {tx.amount} {tx.currency}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{tx.currency}</Badge>
                      </TableCell>
                      <TableCell>
                        {tx.nexoraAmount?.toFixed(4) ?? "—"} NXR
                      </TableCell>
                      <TableCell>
                        {tx.walletAddress ? (
                          <div className="flex items-center gap-1">
                            <span className="font-mono text-xs">
                              {tx.walletAddress.slice(0, 10)}...
                            </span>
                            <button
                              onClick={() =>
                                handleCopyWallet(tx.walletAddress!)
                              }
                              className="p-1 hover:bg-muted rounded"
                            >
                              {copied ? (
                                <CheckIcon className="size-3 text-green-500" />
                              ) : (
                                <Copy className="size-3 text-muted-foreground" />
                              )}
                            </button>
                          </div>
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
                          {tx.status.toLowerCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => openDetail(tx)}
                          >
                            <EyeIcon className="size-4" />
                          </Button>
                          {tx.status === "PENDING" && (
                            <>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white gap-1"
                                onClick={() => openConfirm(tx, "APPROVE")}
                              >
                                <CheckCircleIcon className="size-3" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="gap-1"
                                onClick={() => openConfirm(tx, "REJECT")}
                              >
                                <XCircleIcon className="size-3" />
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Detail Modal ───────────────────────────────────── */}
      {selectedTx && (
        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Withdrawal Details</DialogTitle>
              <DialogDescription>
                Full information for this withdrawal request
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-1 mt-2">
              {[
                { label: "Transaction ID", value: selectedTx.id },
                { label: "User", value: selectedTx.user?.name },
                { label: "Email", value: selectedTx.user?.email },
                {
                  label: "Amount",
                  value: `${selectedTx.amount} ${selectedTx.currency}`,
                },
                {
                  label: "NEXORA Deducted",
                  value: `${selectedTx.nexoraAmount?.toFixed(4)} NEXORA`,
                },
                { label: "Currency", value: selectedTx.currency },
                {
                  label: "Wallet Address",
                  value: selectedTx.walletAddress || "Not provided",
                  copyable: !!selectedTx.walletAddress,
                },
                {
                  label: "Date",
                  value: format(
                    new Date(selectedTx.createdAt),
                    "MMM dd, yyyy · hh:mm a",
                  ),
                },
                { label: "Status", value: selectedTx.status },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex justify-between items-start py-2 border-b last:border-0"
                >
                  <p className="text-sm text-muted-foreground shrink-0">
                    {row.label}
                  </p>
                  <div className="flex items-center gap-1 max-w-52">
                    <p className="text-sm font-medium text-right break-all">
                      {row.value}
                    </p>
                    {row.copyable && (
                      <button
                        onClick={() =>
                          handleCopyWallet(selectedTx.walletAddress!)
                        }
                        className="p-1 hover:bg-muted rounded shrink-0"
                      >
                        {copied ? (
                          <CheckIcon className="size-3 text-green-500" />
                        ) : (
                          <Copy className="size-3 text-muted-foreground" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Reminder for admin */}
            {selectedTx.status === "PENDING" && (
              <div className="rounded-lg bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 p-3 mt-2">
                <p className="text-xs text-yellow-700 dark:text-yellow-300">
                  ⚠️ Before approving, make sure you have manually sent{" "}
                  <span className="font-semibold">
                    {selectedTx.amount} {selectedTx.currency}
                  </span>{" "}
                  to{" "}
                  <span className="font-mono font-semibold">
                    {selectedTx.walletAddress}
                  </span>
                </p>
              </div>
            )}

            {selectedTx.status === "PENDING" && (
              <DialogFooter className="gap-2 mt-2">
                <Button
                  variant="destructive"
                  onClick={() => {
                    setDetailOpen(false);
                    openConfirm(selectedTx, "REJECT");
                  }}
                >
                  Reject
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => {
                    setDetailOpen(false);
                    openConfirm(selectedTx, "APPROVE");
                  }}
                >
                  Approve
                </Button>
              </DialogFooter>
            )}
          </DialogContent>
        </Dialog>
      )}

      {/* ── Confirm Modal ──────────────────────────────────── */}
      {confirmTx && confirmAction && (
        <Dialog
          open={!!confirmAction}
          onOpenChange={() => {
            setConfirmAction(null);
            setConfirmTx(null);
          }}
        >
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>
                {confirmAction === "APPROVE"
                  ? "Approve Withdrawal"
                  : "Reject Withdrawal"}
              </DialogTitle>
              <DialogDescription>
                {confirmAction === "APPROVE"
                  ? `Confirm you have already sent ${confirmTx.amount} ${confirmTx.currency} to the user's wallet.`
                  : `This will reject the withdrawal and refund ${confirmTx.nexoraAmount?.toFixed(4)} NEXORA back to ${confirmTx.user?.name}.`}
              </DialogDescription>
            </DialogHeader>

            <div className="rounded-lg bg-muted/40 p-3 flex flex-col gap-2">
              {[
                { label: "User", value: confirmTx.user?.name },
                {
                  label: "Amount",
                  value: `${confirmTx.amount} ${confirmTx.currency}`,
                },
                {
                  label: "NEXORA",
                  value: `${confirmTx.nexoraAmount?.toFixed(4)} NXR`,
                },
                {
                  label: "Send To",
                  value: confirmTx.walletAddress ?? "—",
                },
              ].map((row) => (
                <div key={row.label} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="font-medium font-mono text-xs max-w-36 text-right break-all">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            {confirmAction === "APPROVE" && (
              <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950 rounded-md p-2">
                ⚠️ Only approve after you have manually sent the crypto. This
                cannot be undone.
              </p>
            )}

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setConfirmAction(null);
                  setConfirmTx(null);
                }}
              >
                Cancel
              </Button>
              {confirmAction === "APPROVE" ? (
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={handleApprove}
                  disabled={approving}
                >
                  {approving ? "Approving..." : "Yes, I've Sent It"}
                </Button>
              ) : (
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={rejecting}
                >
                  {rejecting ? "Rejecting..." : "Yes, Reject & Refund"}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
