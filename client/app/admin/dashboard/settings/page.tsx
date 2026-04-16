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
  Loader2,
  SaveIcon,
  BarChart2Icon,
  CoinsIcon,
  MegaphoneIcon,
  RefreshCwIcon,
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
  useUpdateSiteSettingsMutation,
} from "@/state/api/adminApi";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

export default function AdminSettingsPage() {
  const { data: settingsData, isLoading } = useGetSiteSettingsQuery();
  const [updateSettings, { isLoading: saving }] =
    useUpdateSiteSettingsMutation();

  // Form state
  const [totalSupply, setTotalSupply] = useState("");
  const [volume, setVolume] = useState("");
  const [promoActive, setPromoActive] = useState(false);
  const [promoText, setPromoText] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingSection, setPendingSection] = useState<
    "supply" | "volume" | "promo" | null
  >(null);

  // Populate from DB
  React.useEffect(() => {
    if (settingsData?.data) {
      const s = settingsData.data;
      setTotalSupply(s.totalSupply?.toString() ?? "");
      setVolume(s.volume?.toString() ?? "");
      setPromoActive(s.promoActive ?? false);
      setPromoText(s.promoText ?? "");
    }
  }, [settingsData]);

  const settings = settingsData?.data;

  const handleSave = async (section: "supply" | "volume" | "promo") => {
    try {
      if (section === "supply") {
        const val = parseFloat(totalSupply);
        if (isNaN(val) || val <= 0) {
          toast.error("Enter a valid total supply");
          return;
        }
        await updateSettings({ totalSupply: val }).unwrap();
        toast.success("Total supply updated");
      }

      if (section === "volume") {
        const val = parseFloat(volume);
        if (isNaN(val) || val < 0) {
          toast.error("Enter a valid volume");
          return;
        }
        await updateSettings({ volume: val }).unwrap();
        toast.success("Volume updated");
      }

      if (section === "promo") {
        if (promoActive && !promoText.trim()) {
          toast.error("Promo text cannot be empty when promo is active");
          return;
        }
        await updateSettings({
          promoActive,
          promoText: promoText.trim(),
        }).unwrap();
        toast.success("Promo banner updated");
      }

      setConfirmOpen(false);
      setPendingSection(null);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update settings");
    }
  };

  const openConfirm = (section: "supply" | "volume" | "promo") => {
    setPendingSection(section);
    setConfirmOpen(true);
  };

  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6 pb-10">
      <Header title="Site Settings" />

      {/* ── Current Overview ───────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Supply",
            value: isLoading
              ? null
              : settings?.totalSupply
                ? `${(settings.totalSupply / 1e6).toFixed(0)}M`
                : "—",
            icon: CoinsIcon,
            color: "text-blue-500",
            bg: "bg-blue-50 dark:bg-blue-950",
          },
          {
            label: "Volume (24H)",
            value: isLoading
              ? null
              : settings?.volume
                ? `$${(settings.volume / 1e6).toFixed(2)}M`
                : "—",
            icon: BarChart2Icon,
            color: "text-purple-500",
            bg: "bg-purple-50 dark:bg-purple-950",
          },
          {
            label: "Market Cap",
            value: isLoading
              ? null
              : settings?.marketCap
                ? `$${(settings.marketCap / 1e9).toFixed(2)}B`
                : "—",
            icon: RefreshCwIcon,
            color: "text-green-500",
            bg: "bg-green-50 dark:bg-green-950",
          },
          {
            label: "Promo Banner",
            value: isLoading
              ? null
              : settings?.promoActive
                ? "Active"
                : "Inactive",
            icon: MegaphoneIcon,
            color: settings?.promoActive
              ? "text-yellow-500"
              : "text-muted-foreground",
            bg: settings?.promoActive
              ? "bg-yellow-50 dark:bg-yellow-950"
              : "bg-muted/40",
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
                    <Skeleton className="h-6 w-16 mt-1" />
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Total Supply ────────────────────────────────── */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CoinsIcon className="size-5 text-blue-500" />
              <div>
                <CardTitle>Total Token Supply</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Total NEXORA tokens in existence — used to calculate market
                  cap
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {isLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <>
                <div className="rounded-lg bg-muted/40 p-3 flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    Current Supply
                  </p>
                  <p className="font-bold">
                    {settings?.totalSupply?.toLocaleString() ?? "—"} NEXORA
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>New Total Supply</Label>
                  <Input
                    type="number"
                    placeholder="e.g. 100000000"
                    value={totalSupply}
                    onChange={(e) => setTotalSupply(e.target.value)}
                    min="0"
                  />
                  {totalSupply && !isNaN(parseFloat(totalSupply)) && (
                    <p className="text-xs text-muted-foreground">
                      = {parseFloat(totalSupply).toLocaleString()} NEXORA
                    </p>
                  )}
                </div>
                <Button
                  className="gap-2 w-fit"
                  onClick={() => openConfirm("supply")}
                  disabled={saving || !totalSupply}
                >
                  <SaveIcon className="size-4" />
                  Save Supply
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* ── Volume ──────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart2Icon className="size-5 text-purple-500" />
              <div>
                <CardTitle>24H Trading Volume</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Displayed on market overview — set manually or match real
                  volume
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {isLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <>
                <div className="rounded-lg bg-muted/40 p-3 flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    Current Volume
                  </p>
                  <p className="font-bold">
                    ${settings?.volume?.toLocaleString() ?? "—"}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>New Volume (USD)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                    <Input
                      type="number"
                      placeholder="e.g. 12320000"
                      value={volume}
                      onChange={(e) => setVolume(e.target.value)}
                      className="pl-7"
                      min="0"
                    />
                  </div>
                  {volume && !isNaN(parseFloat(volume)) && (
                    <p className="text-xs text-muted-foreground">
                      = ${parseFloat(volume).toLocaleString()} USD
                      {parseFloat(volume) >= 1e6 &&
                        ` (${(parseFloat(volume) / 1e6).toFixed(2)}M)`}
                    </p>
                  )}
                </div>

                {/* Quick set buttons */}
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Quick set
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: "1M", value: 1000000 },
                      { label: "5M", value: 5000000 },
                      { label: "10M", value: 10000000 },
                      { label: "50M", value: 50000000 },
                      { label: "100M", value: 100000000 },
                    ].map((btn) => (
                      <Button
                        key={btn.label}
                        variant="outline"
                        size="sm"
                        onClick={() => setVolume(btn.value.toString())}
                      >
                        ${btn.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <Button
                  className="gap-2 w-fit"
                  onClick={() => openConfirm("volume")}
                  disabled={saving || !volume}
                >
                  <SaveIcon className="size-4" />
                  Save Volume
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Promo Banner ────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MegaphoneIcon className="size-5 text-yellow-500" />
            <div>
              <CardTitle>Promo Banner</CardTitle>
              <p className="text-sm text-muted-foreground">
                Shown at the top of the user dashboard when active
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          {isLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : (
            <>
              {/* Toggle */}
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium text-sm">Promo Banner Status</p>
                  <p className="text-xs text-muted-foreground">
                    {promoActive
                      ? "Banner is visible to all users"
                      : "Banner is hidden from users"}
                  </p>
                </div>
                <Switch
                  checked={promoActive}
                  onCheckedChange={setPromoActive}
                />
              </div>

              {/* Promo text */}
              <div className="space-y-2">
                <Label>Promo Message</Label>
                <Textarea
                  placeholder="e.g. 🚀 Special offer! Deposit now and get 2x NEXORA bonus. Limited time only!"
                  value={promoText}
                  onChange={(e) => setPromoText(e.target.value)}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  {promoText.length} characters
                </p>
              </div>

              {/* Preview */}
              {promoText && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">
                    Preview
                  </Label>
                  <div className="rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 p-3 flex items-center gap-3">
                    <MegaphoneIcon className="size-4 text-white shrink-0" />
                    <p className="text-sm text-white font-medium">
                      {promoText}
                    </p>
                  </div>
                </div>
              )}

              <Button
                className="gap-2 w-fit"
                onClick={() => openConfirm("promo")}
                disabled={saving}
              >
                <SaveIcon className="size-4" />
                Save Promo Settings
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* ── Danger Zone ─────────────────────────────────────── */}
      <Card className="border-red-200 dark:border-red-900">
        <CardHeader>
          <CardTitle className="text-red-500">Danger Zone</CardTitle>
          <p className="text-sm text-muted-foreground">
            These actions affect all users immediately
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-center justify-between rounded-lg border border-red-200 dark:border-red-900 p-4">
            <div>
              <p className="font-medium text-sm">Reset All Market Stats</p>
              <p className="text-xs text-muted-foreground">
                Sets volume and market cap display back to zero
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={async () => {
                try {
                  await updateSettings({ volume: 0 }).unwrap();
                  setVolume("0");
                  toast.success("Market stats reset to zero");
                } catch {
                  toast.error("Failed to reset stats");
                }
              }}
            >
              Reset Stats
            </Button>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-red-200 dark:border-red-900 p-4">
            <div>
              <p className="font-medium text-sm">Disable Promo Banner</p>
              <p className="text-xs text-muted-foreground">
                Immediately hides promo banner from all users
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={async () => {
                try {
                  await updateSettings({ promoActive: false }).unwrap();
                  setPromoActive(false);
                  toast.success("Promo banner disabled");
                } catch {
                  toast.error("Failed to disable promo");
                }
              }}
            >
              Disable Promo
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Confirm Dialog ─────────────────────────────────── */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {pendingSection === "supply" && "Update Total Supply"}
              {pendingSection === "volume" && "Update Volume"}
              {pendingSection === "promo" && "Update Promo Banner"}
            </DialogTitle>
            <DialogDescription>
              {pendingSection === "supply" &&
                `Set total supply to ${parseFloat(totalSupply || "0").toLocaleString()} NEXORA. This affects market cap calculations.`}
              {pendingSection === "volume" &&
                `Set 24H volume to $${parseFloat(volume || "0").toLocaleString()} USD.`}
              {pendingSection === "promo" &&
                `${promoActive ? "Activate" : "Deactivate"} the promo banner${promoActive ? ` with the message: "${promoText}"` : ""}.`}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setConfirmOpen(false);
                setPendingSection(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => pendingSection && handleSave(pendingSection)}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                "Confirm"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
