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
  ArrowDownCircleIcon,
  ClockIcon,
} from "lucide-react";
import { Transaction, TransactionStatus } from "@/state/types";
import {
  useApproveDepositMutation,
  useGetAllDepositsQuery,
  useRejectDepositMutation,
} from "@/state/api/adminApi";

const statusColor: Record<TransactionStatus, string> = {
  PENDING:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  APPROVED: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  REJECTED: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

export default function AdminDepositsPage() {
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

  const { data, isLoading, refetch } = useGetAllDepositsQuery(
    statusFilter === "ALL" ? undefined : statusFilter,
  );
  const [approveDeposit, { isLoading: approving }] =
    useApproveDepositMutation();
  const [rejectDeposit, { isLoading: rejecting }] = useRejectDepositMutation();

  const deposits = data?.data ?? [];

  // Client-side search filter
  const filtered = deposits.filter((tx) => {
    const q = search.toLowerCase();
    return (
      tx.user?.name?.toLowerCase().includes(q) ||
      tx.user?.email?.toLowerCase().includes(q) ||
      tx.currency.toLowerCase().includes(q) ||
      tx.txHash?.toLowerCase().includes(q) ||
      tx.id.toLowerCase().includes(q)
    );
  });

  // Stats
  const pending = deposits.filter((t) => t.status === "PENDING").length;
  const approved = deposits.filter((t) => t.status === "APPROVED").length;
  const rejected = deposits.filter((t) => t.status === "REJECTED").length;
  const totalAmount = deposits
    .filter((t) => t.status === "APPROVED")
    .reduce((sum, t) => sum + t.amount, 0);

  const handleApprove = async () => {
    if (!confirmTx) return;
    try {
      await approveDeposit(confirmTx.id).unwrap();
      toast.success(
        `Deposit approved — NEXORA credited to ${confirmTx.user?.name}`,
      );
      setConfirmAction(null);
      setConfirmTx(null);
      setDetailOpen(false);
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to approve deposit");
    }
  };

  const handleReject = async () => {
    if (!confirmTx) return;
    try {
      await rejectDeposit(confirmTx.id).unwrap();
      toast.success("Deposit rejected");
      setConfirmAction(null);
      setConfirmTx(null);
      setDetailOpen(false);
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to reject deposit");
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
      <Header title="Deposits" />

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
            label: "Total Approved",
            value: `$${totalAmount.toFixed(2)}`,
            icon: ArrowDownCircleIcon,
            color: "text-blue-500",
            bg: "bg-blue-50 dark:bg-blue-950",
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

      {/* ── Table ──────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle>All Deposits</CardTitle>
            <div className="flex gap-2">
              {/* Search */}
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search user, currency, hash..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              {/* Status Filter */}
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
              No deposits found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Currency</TableHead>
                    <TableHead>NEXORA</TableHead>
                    <TableHead>Tx Hash</TableHead>
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
                        {tx.txHash ? (
                          <span className="font-mono text-xs">
                            {tx.txHash.slice(0, 12)}...
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-xs">
                            Not provided
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
                          {/* View detail */}
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => openDetail(tx)}
                          >
                            <EyeIcon className="size-4" />
                          </Button>
                          {/* Approve / Reject only for pending */}
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
              <DialogTitle>Deposit Details</DialogTitle>
              <DialogDescription>
                Full information for this deposit request
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-3 mt-2">
              {[
                { label: "Transaction ID", value: selectedTx.id },
                { label: "User", value: selectedTx.user?.name },
                { label: "Email", value: selectedTx.user?.email },
                {
                  label: "Amount",
                  value: `${selectedTx.amount} ${selectedTx.currency}`,
                },
                {
                  label: "NEXORA to Credit",
                  value: `${selectedTx.nexoraAmount?.toFixed(4)} NEXORA`,
                },
                { label: "Currency", value: selectedTx.currency },
                {
                  label: "Tx Hash",
                  value: selectedTx.txHash || "Not provided",
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
                  <p className="text-sm text-muted-foreground">{row.label}</p>
                  <p className="text-sm font-medium text-right max-w-48 break-all">
                    {row.value}
                  </p>
                </div>
              ))}
            </div>
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

      {/* ── Confirm Action Modal ───────────────────────────── */}
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
                  ? "Approve Deposit"
                  : "Reject Deposit"}
              </DialogTitle>
              <DialogDescription>
                {confirmAction === "APPROVE"
                  ? `This will credit ${confirmTx.nexoraAmount?.toFixed(4)} NEXORA to ${confirmTx.user?.name}'s account.`
                  : `This will reject the deposit of ${confirmTx.amount} ${confirmTx.currency} from ${confirmTx.user?.name}.`}
              </DialogDescription>
            </DialogHeader>

            <div className="rounded-lg bg-muted/40 p-3 flex flex-col gap-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">User</span>
                <span className="font-medium">{confirmTx.user?.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-medium">
                  {confirmTx.amount} {confirmTx.currency}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">NEXORA</span>
                <span className="font-medium">
                  {confirmTx.nexoraAmount?.toFixed(4)} NXR
                </span>
              </div>
            </div>

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
                  {approving ? "Approving..." : "Yes, Approve"}
                </Button>
              ) : (
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={rejecting}
                >
                  {rejecting ? "Rejecting..." : "Yes, Reject"}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
