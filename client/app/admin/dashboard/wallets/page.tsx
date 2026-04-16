"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import Header from "@/components/code/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Copy,
  CheckIcon,
  Loader2,
  WalletIcon,
  PencilIcon,
  SaveIcon,
  XIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  useGetSiteSettingsQuery,
  useUpdateWalletsMutation,
} from "@/state/api/adminApi";

interface WalletField {
  key: "usdtWallet" | "usdcWallet" | "btcWallet";
  label: string;
  symbol: string;
  color: string;
  bg: string;
  placeholder: string;
  network: string;
}

const WALLETS: WalletField[] = [
  {
    key: "usdtWallet",
    label: "USDT Wallet",
    symbol: "USDT",
    color: "text-green-600",
    bg: "bg-green-50 dark:bg-green-950",
    placeholder: "TYourUSDTWalletAddress...",
    network: "TRC-20 / ERC-20",
  },
  {
    key: "usdcWallet",
    label: "USDC Wallet",
    symbol: "USDC",
    color: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-950",
    placeholder: "0xYourUSDCWalletAddress...",
    network: "ERC-20",
  },
  {
    key: "btcWallet",
    label: "BTC Wallet",
    symbol: "BTC",
    color: "text-orange-500",
    bg: "bg-orange-50 dark:bg-orange-950",
    placeholder: "bc1YourBTCWalletAddress...",
    network: "Bitcoin Network",
  },
];

export default function AdminWalletsPage() {
  const { data: settingsData, isLoading } = useGetSiteSettingsQuery();
  const [updateWallets, { isLoading: saving }] = useUpdateWalletsMutation();

  // Edit state per wallet
  const [editing, setEditing] = useState<Record<string, boolean>>({});
  const [values, setValues] = useState({
    usdtWallet: "",
    usdcWallet: "",
    btcWallet: "",
  });
  const [copied, setCopied] = useState<string | null>(null);
  const [confirmWallet, setConfirmWallet] = useState<WalletField | null>(null);
  const [pendingValue, setPendingValue] = useState("");

  // Populate from DB
  React.useEffect(() => {
    if (settingsData?.data) {
      setValues({
        usdtWallet: settingsData.data.usdtWallet ?? "",
        usdcWallet: settingsData.data.usdcWallet ?? "",
        btcWallet: settingsData.data.btcWallet ?? "",
      });
    }
  }, [settingsData]);

  const handleCopy = (address: string, key: string) => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleEdit = (key: string) => {
    setEditing((prev) => ({ ...prev, [key]: true }));
  };

  const handleCancel = (key: string) => {
    // Reset to DB value
    if (settingsData?.data) {
      setValues((prev) => ({
        ...prev,
        [key]:
          (settingsData.data[
            key as keyof typeof settingsData.data
          ] as string) ?? "",
      }));
    }
    setEditing((prev) => ({ ...prev, [key]: false }));
  };

  const handleSaveClick = (wallet: WalletField) => {
    const value = values[wallet.key].trim();
    if (!value) {
      toast.error("Wallet address cannot be empty");
      return;
    }

    setPendingValue(value);
    setConfirmWallet(wallet);
  };

  const handleConfirmSave = async () => {
    if (!confirmWallet) return;
    try {
      await updateWallets({
        [confirmWallet.key]: pendingValue,
      }).unwrap();
      toast.success(`${confirmWallet.label} updated successfully`);

      setEditing((prev) => ({ ...prev, [confirmWallet.key]: false }));
      setConfirmWallet(null);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update wallet");
    }
  };

  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6 pb-10">
      <Header title="Wallet Addresses" />

      {/* ── Info Banner ────────────────────────────────────── */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800 p-4">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          <span className="font-semibold">Important:</span> These are the wallet
          addresses shown to users when they make a deposit. Make sure they are
          correct before saving. Any deposits sent to a wrong address cannot be
          recovered.
        </p>
      </div>

      {/* ── Wallet Cards ───────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        {WALLETS.map((wallet) => {
          const isEditing = editing[wallet.key];
          const currentValue = values[wallet.key];
          const dbValue = (settingsData?.data?.[wallet.key] as string) ?? "";
          const hasAddress = !!dbValue;

          return (
            <Card key={wallet.key}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${wallet.bg}`}>
                      <WalletIcon className={`size-5 ${wallet.color}`} />
                    </div>
                    <div>
                      <CardTitle className="text-base">
                        {wallet.label}
                      </CardTitle>
                    </div>
                  </div>
                  {/* Status badge */}
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      hasAddress
                        ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                        : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                    }`}
                  >
                    {hasAddress ? "Configured" : "Not set"}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {isLoading ? (
                  <Skeleton className="h-10 w-full" />
                ) : isEditing ? (
                  /* Edit mode */
                  <div className="flex flex-col gap-3">
                    <div className="space-y-2">
                      <Label>New {wallet.symbol} Address</Label>
                      <Input
                        value={currentValue}
                        onChange={(e) =>
                          setValues((prev) => ({
                            ...prev,
                            [wallet.key]: e.target.value,
                          }))
                        }
                        placeholder={wallet.placeholder}
                        className="font-mono text-sm"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        className="flex-1 gap-2"
                        onClick={() => handleSaveClick(wallet)}
                        disabled={saving || !currentValue.trim()}
                      >
                        {saving ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <SaveIcon className="size-4" />
                        )}
                        Save
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 gap-2"
                        onClick={() => handleCancel(wallet.key)}
                      >
                        <XIcon className="size-4" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* View mode */
                  <div className="flex flex-col gap-3">
                    <div className="rounded-lg border bg-muted/40 p-3">
                      {hasAddress ? (
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-mono text-sm break-all">
                            {dbValue}
                          </p>
                          <button
                            onClick={() => handleCopy(dbValue, wallet.key)}
                            className="shrink-0 p-1.5 rounded-md hover:bg-muted transition-colors"
                          >
                            {copied === wallet.key ? (
                              <CheckIcon className="size-4 text-green-500" />
                            ) : (
                              <Copy className="size-4 text-muted-foreground" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">
                          No address configured yet
                        </p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      className="gap-2 w-fit"
                      onClick={() => handleEdit(wallet.key)}
                    >
                      <PencilIcon className="size-4" />
                      {hasAddress ? "Update Address" : "Set Address"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ── Update All at Once ─────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Update All Wallets</CardTitle>
          <p className="text-sm text-muted-foreground">
            Update all three wallet addresses at once
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {WALLETS.map((wallet) => (
            <div key={wallet.key} className="space-y-2">
              <Label>{wallet.label}</Label>
              <div className="relative">
                <div
                  className={`absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold ${wallet.color}`}
                >
                  {wallet.symbol}
                </div>
                <Input
                  value={values[wallet.key]}
                  onChange={(e) =>
                    setValues((prev) => ({
                      ...prev,
                      [wallet.key]: e.target.value,
                    }))
                  }
                  placeholder={wallet.placeholder}
                  className="pl-14 font-mono text-sm"
                />
              </div>
            </div>
          ))}

          <Button
            className="w-full gap-2"
            disabled={saving}
            onClick={async () => {
              const hasEmpty = WALLETS.some((w) => !values[w.key].trim());
              if (hasEmpty) {
                toast.error("All wallet addresses are required");
                return;
              }
              try {
                await updateWallets({
                  usdtWallet: values.usdtWallet.trim(),
                  usdcWallet: values.usdcWallet.trim(),
                  btcWallet: values.btcWallet.trim(),
                }).unwrap();
                toast.success("All wallet addresses updated successfully");
                setEditing({});
              } catch (error: any) {
                toast.error(error?.data?.message || "Failed to update wallets");
              }
            }}
          >
            {saving ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <SaveIcon className="size-4" />
                Save All Wallets
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* ── Confirm Dialog ─────────────────────────────────── */}
      {confirmWallet && (
        <Dialog
          open={!!confirmWallet}
          onOpenChange={() => setConfirmWallet(null)}
        >
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Confirm Wallet Update</DialogTitle>
              <DialogDescription>
                Are you sure you want to update the {confirmWallet.label}? Users
                will immediately see this new address when depositing.
              </DialogDescription>
            </DialogHeader>

            <div className="rounded-lg bg-muted/40 p-3 flex flex-col gap-2">
              <div className="flex flex-col gap-1">
                <p className="text-xs text-muted-foreground">Current Address</p>
                <p className="font-mono text-xs break-all">
                  {(settingsData?.data?.[confirmWallet.key] as string) ||
                    "Not set"}
                </p>
              </div>
              <div className="border-t pt-2 flex flex-col gap-1">
                <p className="text-xs text-muted-foreground">New Address</p>
                <p className="font-mono text-xs break-all text-green-600">
                  {pendingValue}
                </p>
              </div>
            </div>

            <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950 rounded-md p-2">
              ⚠️ Double-check the new address. Deposits sent to a wrong address
              cannot be recovered.
            </p>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setConfirmWallet(null)}>
                Cancel
              </Button>
              <Button onClick={handleConfirmSave} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="size-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  "Yes, Update"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
