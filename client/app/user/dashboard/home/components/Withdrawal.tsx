"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Currency } from "@/state/types";
import { useGetBalanceQuery } from "@/state/api/userApi";
import { useGetCurrentPriceQuery } from "@/state/api/priceApi";
import { useSubmitWithdrawalMutation } from "@/state/api/transactionApi";

interface WithdrawModalProps {
  open: boolean;
  onClose: () => void;
}

export function WithdrawModal({ open, onClose }: WithdrawModalProps) {
  const [currency, setCurrency] = useState<Currency>("USDT");
  const [amount, setAmount] = useState("");
  const [walletAddress, setWalletAddress] = useState("");

  const { data: balanceData } = useGetBalanceQuery();
  const { data: priceData } = useGetCurrentPriceQuery();
  const [submitWithdrawal, { isLoading }] = useSubmitWithdrawalMutation();

  const currentPrice = priceData?.data?.currentPrice ?? 0;
  const nexoraBalance = balanceData?.data?.nexoraBalance ?? 0;
  const portfolioValue = balanceData?.data?.portfolioValue ?? 0;

  // How much NEXORA will be deducted
  const nexoraRequired =
    amount && currentPrice > 0
      ? (parseFloat(amount) / currentPrice).toFixed(4)
      : "0.0000";

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    if (!walletAddress.trim()) {
      toast.error("Enter your wallet address");
      return;
    }
    if (parseFloat(nexoraRequired) > nexoraBalance) {
      toast.error("Insufficient NEXORA balance");
      return;
    }
    try {
      await submitWithdrawal({
        currency,
        amount: parseFloat(amount),
        walletAddress: walletAddress.trim(),
      }).unwrap();
      toast.success("Withdrawal request submitted! Pending admin approval.");
      setAmount("");
      setWalletAddress("");
      onClose();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to submit withdrawal");
    }
  };

  const handleClose = () => {
    setAmount("");
    setWalletAddress("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Withdraw Funds</DialogTitle>
          <DialogDescription>
            Submit a withdrawal request for admin approval
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5 mt-2">
          {/* Balance info */}
          <div className="rounded-lg border bg-muted/40 p-3 flex justify-between items-center">
            <div>
              <p className="text-xs text-muted-foreground">Available Balance</p>
              <p className="font-semibold text-sm">
                {nexoraBalance.toFixed(4)} NEXORA
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Portfolio Value</p>
              <p className="font-semibold text-sm text-blue-500">
                ${portfolioValue.toFixed(2)} USD
              </p>
            </div>
          </div>

          {/* Currency Selector */}
          <div className="space-y-2">
            <Label>Withdraw as</Label>
            <Select
              value={currency}
              onValueChange={(val) => setCurrency(val as Currency)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USDT">USDT</SelectItem>
                <SelectItem value="USDC">USDC</SelectItem>
                <SelectItem value="BTC">BTC</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label>Amount ({currency})</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                $
              </span>
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-7"
                min="0"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                {currency}
              </span>
            </div>
          </div>

          {/* NEXORA deducted */}
          <div className="space-y-2">
            <Label>NEXORA to be deducted</Label>
            <div className="relative">
              <Input
                value={nexoraRequired}
                readOnly
                className="bg-muted/40 text-right pr-20"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                NEXORA
              </span>
            </div>
            {parseFloat(nexoraRequired) > nexoraBalance && (
              <p className="text-xs text-red-500">
                Insufficient NEXORA balance
              </p>
            )}
          </div>

          {/* Wallet Address */}
          <div className="space-y-2">
            <Label>Your {currency} Wallet Address</Label>
            <Input
              placeholder={
                currency === "BTC"
                  ? "bc1q..."
                  : currency === "USDT"
                    ? "T..."
                    : "0x..."
              }
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
            />
          </div>

          {/* Warning */}
          <p className="text-xs text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950 rounded-md p-3">
            ⚠️ NEXORA will be deducted immediately. If rejected by admin, it
            will be refunded to your account.
          </p>

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={isLoading || parseFloat(nexoraRequired) > nexoraBalance}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin mr-2" />
                Submitting...
              </>
            ) : (
              "Submit Withdrawal Request"
            )}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            🔒 Your transaction details are processed securely
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
