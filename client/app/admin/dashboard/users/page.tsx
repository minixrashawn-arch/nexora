"use client";

import { useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import Header from "@/components/code/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  UsersIcon,
  SearchIcon,
  EyeIcon,
  ShieldOffIcon,
  ShieldCheckIcon,
  PlusCircleIcon,
  MinusCircleIcon,
  Loader2,
  ArrowDownCircleIcon,
  ArrowUpCircleIcon,
  WalletIcon,
} from "lucide-react";
import { AdminUser } from "@/state/types";
import {
  useAdjustUserBalanceMutation,
  useGetAllUsersQuery,
  useToggleUserStatusMutation,
} from "@/state/api/adminApi";
import { useGetCurrentPriceQuery } from "@/state/api/priceApi";

type FilterStatus = "ALL" | "ACTIVE" | "SUSPENDED";

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("ALL");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [balanceOpen, setBalanceOpen] = useState(false);
  const [toggleConfirmOpen, setToggleConfirmOpen] = useState(false);
  const [balanceAction, setBalanceAction] = useState<"ADD" | "SUBTRACT">("ADD");
  const [balanceAmount, setBalanceAmount] = useState("");
  const [targetUser, setTargetUser] = useState<AdminUser | null>(null);

  const { data, isLoading, refetch } = useGetAllUsersQuery();
  const { data: priceData } = useGetCurrentPriceQuery();
  const [toggleStatus, { isLoading: toggling }] = useToggleUserStatusMutation();
  const [adjustBalance, { isLoading: adjusting }] =
    useAdjustUserBalanceMutation();

  const users = data?.data ?? [];
  const currentPrice = priceData?.data?.currentPrice ?? 0;

  // Filter
  const filtered = users.filter((user) => {
    const q = search.toLowerCase();
    const matchesSearch =
      user.name.toLowerCase().includes(q) ||
      user.email.toLowerCase().includes(q) ||
      user.id.toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === "ALL"
        ? true
        : statusFilter === "ACTIVE"
          ? user.isActive
          : !user.isActive;

    return matchesSearch && matchesStatus;
  });

  // Stats
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.isActive).length;
  const suspendedUsers = users.filter((u) => !u.isActive).length;
  const totalNexora = users.reduce((sum, u) => sum + u.nexoraBalance, 0);

  const handleToggleStatus = async () => {
    if (!targetUser) return;
    try {
      await toggleStatus(targetUser.id).unwrap();
      toast.success(
        `${targetUser.name} has been ${targetUser.isActive ? "suspended" : "activated"}`,
      );
      setToggleConfirmOpen(false);
      setTargetUser(null);
      setDetailOpen(false);
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update user status");
    }
  };

  const handleAdjustBalance = async () => {
    if (!targetUser || !balanceAmount) return;
    const amount = parseFloat(balanceAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    try {
      await adjustBalance({
        id: targetUser.id,
        amount,
        action: balanceAction,
      }).unwrap();
      toast.success(
        `${balanceAction === "ADD" ? "Added" : "Subtracted"} ${amount} NEXORA ${
          balanceAction === "ADD" ? "to" : "from"
        } ${targetUser.name}'s balance`,
      );
      setBalanceOpen(false);
      setBalanceAmount("");
      setTargetUser(null);
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to adjust balance");
    }
  };

  const openDetail = (user: AdminUser) => {
    setSelectedUser(user);
    setDetailOpen(true);
  };

  const openBalanceModal = (user: AdminUser, action: "ADD" | "SUBTRACT") => {
    setTargetUser(user);
    setBalanceAction(action);
    setBalanceOpen(true);
  };

  const openToggleConfirm = (user: AdminUser) => {
    setTargetUser(user);
    setToggleConfirmOpen(true);
  };

  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6 pb-10">
      <Header title="Users" />

      {/* ── Stats ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Users",
            value: totalUsers,
            icon: UsersIcon,
            color: "text-blue-500",
            bg: "bg-blue-50 dark:bg-blue-950",
          },
          {
            label: "Active",
            value: activeUsers,
            icon: ShieldCheckIcon,
            color: "text-green-500",
            bg: "bg-green-50 dark:bg-green-950",
          },
          {
            label: "Suspended",
            value: suspendedUsers,
            icon: ShieldOffIcon,
            color: "text-red-500",
            bg: "bg-red-50 dark:bg-red-950",
          },
          {
            label: "Total NEXORA",
            value: totalNexora.toFixed(2),
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

      {/* ── Table ──────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle>All Users</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search name, email, ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={(val) => setStatusFilter(val as FilterStatus)}
              >
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Users</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="SUSPENDED">Suspended</SelectItem>
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
              No users found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>NEXORA Balance</TableHead>
                    <TableHead>Portfolio Value</TableHead>
                    <TableHead>Total Deposited</TableHead>
                    <TableHead>Total Withdrawn</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{user.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono font-medium text-sm">
                        {user.nexoraBalance.toFixed(4)}
                      </TableCell>
                      <TableCell className="text-blue-500 font-medium text-sm">
                        ${(user.nexoraBalance * currentPrice).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-green-600 text-sm">
                        ${user.totalDeposited.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-red-500 text-sm">
                        ${user.totalWithdrawn.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {format(new Date(user.createdAt), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            user.isActive
                              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                              : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                          }
                        >
                          {user.isActive ? "Active" : "Suspended"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          {/* View */}
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => openDetail(user)}
                          >
                            <EyeIcon className="size-4" />
                          </Button>
                          {/* Add balance */}
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => openBalanceModal(user, "ADD")}
                          >
                            <PlusCircleIcon className="size-4" />
                          </Button>
                          {/* Subtract balance */}
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => openBalanceModal(user, "SUBTRACT")}
                          >
                            <MinusCircleIcon className="size-4" />
                          </Button>
                          {/* Suspend / Activate */}
                          <Button
                            size="icon"
                            variant="ghost"
                            className={
                              user.isActive
                                ? "text-red-500 hover:text-red-600 hover:bg-red-50"
                                : "text-green-600 hover:text-green-700 hover:bg-green-50"
                            }
                            onClick={() => openToggleConfirm(user)}
                          >
                            {user.isActive ? (
                              <ShieldOffIcon className="size-4" />
                            ) : (
                              <ShieldCheckIcon className="size-4" />
                            )}
                          </Button>
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
      {selectedUser && (
        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
              <DialogDescription>
                Full profile for {selectedUser.name}
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-1 mt-2">
              {[
                { label: "ID", value: selectedUser.id },
                { label: "Name", value: selectedUser.name },
                { label: "Email", value: selectedUser.email },
                {
                  label: "NEXORA Balance",
                  value: `${selectedUser.nexoraBalance.toFixed(4)} NEXORA`,
                },
                {
                  label: "Portfolio Value",
                  value: `$${(selectedUser.nexoraBalance * currentPrice).toFixed(2)} USD`,
                },
                {
                  label: "Total Deposited",
                  value: `$${selectedUser.totalDeposited.toFixed(2)}`,
                },
                {
                  label: "Total Withdrawn",
                  value: `$${selectedUser.totalWithdrawn.toFixed(2)}`,
                },
                {
                  label: "Joined",
                  value: format(
                    new Date(selectedUser.createdAt),
                    "MMM dd, yyyy · hh:mm a",
                  ),
                },
                {
                  label: "Status",
                  value: selectedUser.isActive ? "Active" : "Suspended",
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex justify-between items-start py-2 border-b last:border-0"
                >
                  <p className="text-sm text-muted-foreground">{row.label}</p>
                  <p className="text-sm font-medium text-right max-w-52 break-all">
                    {row.value}
                  </p>
                </div>
              ))}
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2 mt-2">
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => {
                  setDetailOpen(false);
                  openBalanceModal(selectedUser, "ADD");
                }}
              >
                <PlusCircleIcon className="size-4 text-green-600" />
                Add Balance
              </Button>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => {
                  setDetailOpen(false);
                  openBalanceModal(selectedUser, "SUBTRACT");
                }}
              >
                <MinusCircleIcon className="size-4 text-red-500" />
                Subtract Balance
              </Button>
              <Button
                variant={selectedUser.isActive ? "destructive" : "default"}
                className="gap-2"
                onClick={() => {
                  setDetailOpen(false);
                  openToggleConfirm(selectedUser);
                }}
              >
                {selectedUser.isActive ? (
                  <>
                    <ShieldOffIcon className="size-4" />
                    Suspend
                  </>
                ) : (
                  <>
                    <ShieldCheckIcon className="size-4" />
                    Activate
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ── Adjust Balance Modal ───────────────────────────── */}
      {targetUser && (
        <Dialog
          open={balanceOpen}
          onOpenChange={() => {
            setBalanceOpen(false);
            setBalanceAmount("");
            setTargetUser(null);
          }}
        >
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>
                {balanceAction === "ADD" ? "Add" : "Subtract"} NEXORA Balance
              </DialogTitle>
              <DialogDescription>
                Manually adjust {targetUser.name}&apos;s NEXORA balance
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-4 mt-2">
              {/* Current balance */}
              <div className="rounded-lg bg-muted/40 p-3 flex justify-between items-center">
                <div>
                  <p className="text-xs text-muted-foreground">
                    Current Balance
                  </p>
                  <p className="font-bold">
                    {targetUser.nexoraBalance.toFixed(4)} NEXORA
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">
                    Portfolio Value
                  </p>
                  <p className="font-bold text-blue-500">
                    ${(targetUser.nexoraBalance * currentPrice).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Action toggle */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setBalanceAction("ADD")}
                  className={`flex items-center justify-center gap-2 p-2 rounded-lg border text-sm font-medium transition-colors ${
                    balanceAction === "ADD"
                      ? "bg-green-50 border-green-300 text-green-700 dark:bg-green-950 dark:border-green-700 dark:text-green-300"
                      : "bg-muted/40 text-muted-foreground"
                  }`}
                >
                  <ArrowDownCircleIcon className="size-4" />
                  Add
                </button>
                <button
                  onClick={() => setBalanceAction("SUBTRACT")}
                  className={`flex items-center justify-center gap-2 p-2 rounded-lg border text-sm font-medium transition-colors ${
                    balanceAction === "SUBTRACT"
                      ? "bg-red-50 border-red-300 text-red-700 dark:bg-red-950 dark:border-red-700 dark:text-red-300"
                      : "bg-muted/40 text-muted-foreground"
                  }`}
                >
                  <ArrowUpCircleIcon className="size-4" />
                  Subtract
                </button>
              </div>

              {/* Amount input */}
              <div className="space-y-2">
                <Label>Amount (NEXORA)</Label>
                <Input
                  type="number"
                  placeholder="0.0000"
                  value={balanceAmount}
                  onChange={(e) => setBalanceAmount(e.target.value)}
                  min="0"
                  step="0.0001"
                />
                {/* Preview new balance */}
                {balanceAmount && !isNaN(parseFloat(balanceAmount)) && (
                  <p className="text-xs text-muted-foreground">
                    New balance:{" "}
                    <span className="font-semibold text-foreground">
                      {balanceAction === "ADD"
                        ? (
                            targetUser.nexoraBalance + parseFloat(balanceAmount)
                          ).toFixed(4)
                        : (
                            targetUser.nexoraBalance - parseFloat(balanceAmount)
                          ).toFixed(4)}{" "}
                      NEXORA
                    </span>
                  </p>
                )}
                {balanceAction === "SUBTRACT" &&
                  balanceAmount &&
                  parseFloat(balanceAmount) > targetUser.nexoraBalance && (
                    <p className="text-xs text-red-500">
                      Amount exceeds current balance
                    </p>
                  )}
              </div>
            </div>

            <DialogFooter className="gap-2 mt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setBalanceOpen(false);
                  setBalanceAmount("");
                }}
              >
                Cancel
              </Button>
              <Button
                className={
                  balanceAction === "ADD"
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : ""
                }
                variant={
                  balanceAction === "SUBTRACT" ? "destructive" : "default"
                }
                onClick={handleAdjustBalance}
                disabled={
                  adjusting ||
                  !balanceAmount ||
                  isNaN(parseFloat(balanceAmount)) ||
                  parseFloat(balanceAmount) <= 0 ||
                  (balanceAction === "SUBTRACT" &&
                    parseFloat(balanceAmount) > targetUser.nexoraBalance)
                }
              >
                {adjusting ? (
                  <>
                    <Loader2 className="size-4 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  `${balanceAction === "ADD" ? "Add" : "Subtract"} NEXORA`
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ── Toggle Status Confirm ──────────────────────────── */}
      {targetUser && (
        <Dialog
          open={toggleConfirmOpen}
          onOpenChange={() => {
            setToggleConfirmOpen(false);
            setTargetUser(null);
          }}
        >
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>
                {targetUser.isActive ? "Suspend User" : "Activate User"}
              </DialogTitle>
              <DialogDescription>
                {targetUser.isActive
                  ? `${targetUser.name} will lose access to their account immediately.`
                  : `${targetUser.name} will regain full access to their account.`}
              </DialogDescription>
            </DialogHeader>

            <div className="rounded-lg bg-muted/40 p-3 flex flex-col gap-2">
              {[
                { label: "Name", value: targetUser.name },
                { label: "Email", value: targetUser.email },
                {
                  label: "Balance",
                  value: `${targetUser.nexoraBalance.toFixed(4)} NEXORA`,
                },
                {
                  label: "Current Status",
                  value: targetUser.isActive ? "Active" : "Suspended",
                },
              ].map((row) => (
                <div key={row.label} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="font-medium">{row.value}</span>
                </div>
              ))}
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setToggleConfirmOpen(false);
                  setTargetUser(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant={targetUser.isActive ? "destructive" : "default"}
                onClick={handleToggleStatus}
                disabled={toggling}
              >
                {toggling ? (
                  <>
                    <Loader2 className="size-4 animate-spin mr-2" />
                    Processing...
                  </>
                ) : targetUser.isActive ? (
                  "Yes, Suspend"
                ) : (
                  "Yes, Activate"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
