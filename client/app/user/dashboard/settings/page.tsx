"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import Header from "@/components/code/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  UserIcon,
  LockIcon,
  ShieldIcon,
  Loader2,
  SaveIcon,
  Eye,
  EyeOff,
  MailIcon,
  CalendarIcon,
  WalletIcon,
  CopyIcon,
  CheckIcon,
} from "lucide-react";

import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/state/redux";
import {
  clearCredentials,
  selectCurrentUser,
  updateUser,
} from "@/state/slice/authSlice";
import {
  useChangePasswordMutation,
  useGetBalanceQuery,
  useGetProfileQuery,
  useUpdateProfileMutation,
} from "@/state/api/userApi";
import { useGetCurrentPriceQuery } from "@/state/api/priceApi";
import { useLogoutMutation } from "@/state/api/authApi";

export default function UserSettingsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);

  // Name form
  const [name, setName] = useState("");
  const [nameChanged, setNameChanged] = useState(false);

  // Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Modals
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const { data: profileData, isLoading: profileLoading } = useGetProfileQuery();
  const { data: balanceData, isLoading: balanceLoading } = useGetBalanceQuery();
  const { data: priceData } = useGetCurrentPriceQuery();

  const [updateProfile, { isLoading: updatingProfile }] =
    useUpdateProfileMutation();
  const [changePassword, { isLoading: changingPassword }] =
    useChangePasswordMutation();
  const [logout, { isLoading: loggingOut }] = useLogoutMutation();

  const profile = profileData?.data;
  const balance = balanceData?.data;
  const currentPrice = priceData?.data?.currentPrice ?? 0;

  // Populate name from profile
  useEffect(() => {
    if (profile?.name) {
      setName(profile.name);
    }
  }, [profile]);

  // Track if name changed
  useEffect(() => {
    setNameChanged(name !== profile?.name && name.trim().length > 0);
  }, [name, profile?.name]);

  const handleUpdateProfile = async () => {
    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }
    try {
      const res = await updateProfile({ name: name.trim() }).unwrap();
      dispatch(updateUser({ name: res.data.name }));
      toast.success("Profile updated successfully");
      setNameChanged(false);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update profile");
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("All fields are required");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (currentPassword === newPassword) {
      toast.error("New password must be different from current password");
      return;
    }
    try {
      await changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      }).unwrap();
      toast.success("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to change password");
    }
  };

  const handleLogout = async () => {
    try {
      await logout().unwrap();
    } catch {
      // still clear
    } finally {
      dispatch(clearCredentials());
      router.replace("/login");
    }
  };

  const handleCopyId = () => {
    if (!profile?.id) return;
    navigator.clipboard.writeText(profile.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const passwordStrength = (pwd: string) => {
    if (!pwd) return null;
    if (pwd.length < 6)
      return { label: "Too short", color: "text-red-500", width: "w-1/4" };
    if (pwd.length < 8)
      return { label: "Weak", color: "text-orange-500", width: "w-2/4" };
    if (pwd.length < 12)
      return { label: "Good", color: "text-yellow-500", width: "w-3/4" };
    return { label: "Strong", color: "text-green-500", width: "w-full" };
  };

  const strength = passwordStrength(newPassword);

  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6 pb-10">
      <Header title="Settings" />

      {/* ── Account Overview ───────────────────────────────── */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0">
              <span className="text-2xl font-bold text-white">
                {profile?.name?.charAt(0)?.toUpperCase() ?? "U"}
              </span>
            </div>

            {/* Info */}
            <div className="flex-1">
              {profileLoading ? (
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-4 w-56" />
                </div>
              ) : (
                <>
                  <p className="text-xl font-bold">{profile?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {profile?.email}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 px-2 py-0.5 rounded-full font-medium">
                      {profile?.role}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        profile?.isActive
                          ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {profile?.isActive ? "Active" : "Suspended"}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Balance */}
            <div className="sm:text-right">
              {balanceLoading ? (
                <Skeleton className="h-12 w-36" />
              ) : (
                <>
                  <p className="text-2xl font-bold text-purple-500">
                    {balance?.nexoraBalance?.toFixed(4)} NXR
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ≈ ${balance?.portfolioValue?.toFixed(2)} USD
                  </p>
                  <p className="text-xs text-muted-foreground">
                    @ ${currentPrice.toFixed(4)}/NXR
                  </p>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Account Details ────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldIcon className="size-5 text-purple-500" />
            <CardTitle>Account Details</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {profileLoading ? (
            <div className="flex flex-col gap-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {[
                {
                  label: "Account ID",
                  value: profile?.id ?? "—",
                  icon: ShieldIcon,
                  copyable: true,
                },
                {
                  label: "Email",
                  value: profile?.email ?? "—",
                  icon: MailIcon,
                },
                {
                  label: "Member Since",
                  value: profile?.createdAt
                    ? format(new Date(profile.createdAt), "MMMM dd, yyyy")
                    : "—",
                  icon: CalendarIcon,
                },
                {
                  label: "NEXORA Balance",
                  value: `${balance?.nexoraBalance?.toFixed(4) ?? "0"} NEXORA`,
                  icon: WalletIcon,
                },
              ].map((row) => {
                const Icon = row.icon;
                return (
                  <div
                    key={row.label}
                    className="flex items-center justify-between py-3 border-b last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="size-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        {row.label}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-right max-w-52 break-all">
                        {row.value}
                      </p>
                      {row.copyable && (
                        <button
                          onClick={handleCopyId}
                          className="p-1 hover:bg-muted rounded"
                        >
                          {copied ? (
                            <CheckIcon className="size-3 text-green-500" />
                          ) : (
                            <CopyIcon className="size-3 text-muted-foreground" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Update Profile ──────────────────────────────── */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserIcon className="size-5 text-blue-500" />
              <div>
                <CardTitle>Update Profile</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Update your display name
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email-display">Email Address</Label>
              <div className="relative">
                <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="email-display"
                  value={profile?.email ?? ""}
                  disabled
                  className="pl-10 bg-muted/40 cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Email cannot be changed. Contact support if needed.
              </p>
            </div>

            <Button
              className="gap-2 w-fit"
              onClick={handleUpdateProfile}
              disabled={updatingProfile || !nameChanged}
            >
              {updatingProfile ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <SaveIcon className="size-4" />
                  Save Changes
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* ── Change Password ──────────────────────────────── */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <LockIcon className="size-5 text-green-500" />
              <div>
                <CardTitle>Change Password</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Update your account password
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {/* Current password */}
            <div className="space-y-2">
              <Label>Current Password</Label>
              <div className="relative">
                <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* New password */}
            <div className="space-y-2">
              <Label>New Password</Label>
              <div className="relative">
                <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Password strength */}
              {strength && (
                <div className="space-y-1">
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        strength.label === "Too short"
                          ? "bg-red-500"
                          : strength.label === "Weak"
                            ? "bg-orange-500"
                            : strength.label === "Good"
                              ? "bg-yellow-500"
                              : "bg-green-500"
                      } ${strength.width}`}
                    />
                  </div>
                  <p className={`text-xs font-medium ${strength.color}`}>
                    {strength.label}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div className="space-y-2">
              <Label>Confirm New Password</Label>
              <div className="relative">
                <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-xs text-red-500">Passwords do not match</p>
              )}
              {confirmPassword && newPassword === confirmPassword && (
                <p className="text-xs text-green-500">Passwords match ✓</p>
              )}
            </div>

            <Button
              className="gap-2 w-fit"
              onClick={handleChangePassword}
              disabled={
                changingPassword ||
                !currentPassword ||
                !newPassword ||
                !confirmPassword ||
                newPassword !== confirmPassword ||
                newPassword.length < 6
              }
            >
              {changingPassword ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Changing...
                </>
              ) : (
                <>
                  <LockIcon className="size-4" />
                  Change Password
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* ── Danger Zone ─────────────────────────────────────── */}
      <Card className="border-red-200 dark:border-red-900">
        <CardHeader>
          <CardTitle className="text-red-500">Account Actions</CardTitle>
          <p className="text-sm text-muted-foreground">
            Manage your account session
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-center justify-between rounded-lg border border-red-200 dark:border-red-900 p-4">
            <div>
              <p className="font-medium text-sm">Sign Out</p>
              <p className="text-xs text-muted-foreground">
                Log out of your Nexora account on this device
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setLogoutConfirmOpen(true)}
            >
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Logout Confirm Dialog ──────────────────────────── */}
      <Dialog open={logoutConfirmOpen} onOpenChange={setLogoutConfirmOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Sign Out</DialogTitle>
            <DialogDescription>
              Are you sure you want to sign out of your Nexora account?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setLogoutConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleLogout}
              disabled={loggingOut}
            >
              {loggingOut ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Signing out...
                </>
              ) : (
                "Yes, Sign Out"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
