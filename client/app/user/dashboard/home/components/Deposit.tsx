"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Copy, CheckIcon } from "lucide-react";
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
import {
  useGetDepositWalletsQuery,
  useSubmitDepositMutation,
} from "@/state/api/transactionApi";
import { useGetCurrentPriceQuery } from "@/state/api/priceApi";

interface DepositModalProps {
  open: boolean;
  onClose: () => void;
}

export function DepositModal({ open, onClose }: DepositModalProps) {
  const [currency, setCurrency] = useState<Currency>("USDT");
  const [amount, setAmount] = useState("");
  const [txHash, setTxHash] = useState("");
  const [copied, setCopied] = useState(false);

  const { data: walletsData } = useGetDepositWalletsQuery();
  const { data: priceData } = useGetCurrentPriceQuery();
  const [submitDeposit, { isLoading }] = useSubmitDepositMutation();

  const wallets = walletsData?.data;
  const currentPrice = priceData?.data?.currentPrice ?? 0;

  const walletAddress =
    currency === "USDT"
      ? wallets?.usdtWallet
      : currency === "USDC"
        ? wallets?.usdcWallet
        : wallets?.btcWallet;

  const nexoraAmount =
    amount && currentPrice > 0
      ? (parseFloat(amount) / currentPrice).toFixed(4)
      : "0.0000";

  const handleCopy = () => {
    if (!walletAddress) return;
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    if (!walletAddress) {
      toast.error("Wallet address not configured yet");
      return;
    }
    try {
      await submitDeposit({
        currency,
        amount: parseFloat(amount),
        txHash: txHash || undefined,
      }).unwrap();
      toast.success("Deposit request submitted! Pending admin approval.");
      setAmount("");
      setTxHash("");
      onClose();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to submit deposit");
    }
  };

  const handleClose = () => {
    setAmount("");
    setTxHash("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Deposit Crypto</DialogTitle>
          <DialogDescription>
            Select a cryptocurrency and follow the instructions
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5 mt-2">
          {/* Currency Selector */}
          <div className="space-y-2">
            <Label>Select Cryptocurrency</Label>
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

          {/* Wallet Address */}
          <div className="space-y-2">
            <Label>Deposit Address for {currency}</Label>
            <div className="rounded-lg border bg-muted/40 p-3">
              <p className="text-xs text-muted-foreground mb-2">
                Send {currency} to this address:
              </p>
              <div className="flex items-center justify-between gap-2 bg-background rounded-md p-2 border">
                <p className="text-xs font-mono break-all">
                  {walletAddress || "Not configured yet"}
                </p>
                <button
                  onClick={handleCopy}
                  disabled={!walletAddress}
                  className="shrink-0 p-1.5 rounded-md hover:bg-muted transition-colors disabled:opacity-40"
                >
                  {copied ? (
                    <CheckIcon className="size-4 text-green-500" />
                  ) : (
                    <Copy className="size-4 text-muted-foreground" />
                  )}
                </button>
              </div>
              <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
                ⚠️ Only send {currency} to this address. Sending other tokens
                may result in loss of funds.
              </p>
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label>Amount to spend ({currency})</Label>
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

          {/* You will receive */}
          <div className="space-y-2">
            <Label>You will receive (NEXORA)</Label>
            <div className="relative">
              <Input
                value={nexoraAmount}
                readOnly
                className="bg-muted/40 text-right pr-20"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                NEXORA
              </span>
            </div>
          </div>

          {/* Transaction Hash */}
          <div className="space-y-2">
            <Label>
              Transaction ID / Hash{" "}
              <span className="text-muted-foreground font-normal">
                (Optional, but helpful)
              </span>
            </Label>
            <Input
              placeholder="e.g. 0x123abc..."
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
            />
          </div>

          {/* Info */}
          <p className="text-xs text-blue-500 bg-blue-50 dark:bg-blue-950 dark:text-blue-400 rounded-md p-3">
            After sending the {currency} to the address above, fill in the
            amount and optionally your transaction ID. Our team will verify and
            credit your account.
          </p>

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin mr-2" />
                Submitting...
              </>
            ) : (
              "Submit Deposit Request"
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
