"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  useForgotPasswordMutation,
  useVerifyOTPMutation,
} from "@/state/api/authApi";

const VerifyOTPPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState("");
  const [verifyOTP, { isLoading }] = useVerifyOTPMutation();
  const [resendOTP, { isLoading: isResending }] = useForgotPasswordMutation();

  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter the complete 6-digit OTP");
      return;
    }
    try {
      await verifyOTP({ email, otp }).unwrap();
      toast.success("OTP verified!");
      router.push(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch (error: any) {
      toast.error(error?.data?.message || "Invalid or expired OTP");
    }
  };

  const handleResend = async () => {
    try {
      await resendOTP({ email }).unwrap();
      toast.success("New OTP sent to your email!");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to resend OTP");
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle>Verify OTP</CardTitle>
        <CardDescription>
          Enter the 6-digit code sent to{" "}
          <span className="font-medium text-foreground">{email}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-6">
        {/* Shadcn OTP Input */}
        <InputOTP maxLength={6} value={otp} onChange={(value) => setOtp(value)}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>

        <Button
          className="w-full"
          onClick={handleVerify}
          disabled={isLoading || otp.length !== 6}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Verifying...
            </>
          ) : (
            "Verify OTP"
          )}
        </Button>

        <div className="text-center text-sm text-muted-foreground">
          <p>
            Didn&apos;t receive the code?{" "}
            <button
              onClick={handleResend}
              disabled={isResending}
              className="text-blue-500 hover:text-blue-700 font-medium disabled:opacity-50"
            >
              {isResending ? "Resending..." : "Resend OTP"}
            </button>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default VerifyOTPPage;
