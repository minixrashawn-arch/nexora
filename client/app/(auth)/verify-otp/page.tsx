import { Suspense } from "react";
import VerifyOTPForm from "./VerifyOTPForm";

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyOTPForm />
    </Suspense>
  );
}
