import Image from "next/image";
import Link from "next/link";
import React, { ReactNode } from "react";

interface ChildrenProp {
  children: ReactNode;
}

const AuthLayout = ({ children }: ChildrenProp) => {
  return (
    <div className="relative min-h-svh flex flex-col justify-center items-center">
      <div className="flex w-full max-w-md flex-col gap-6">
        <Link
          href={"/"}
          className="flex text-black items-center self-center font-bold"
        >
          <Image src={"/6.png"} alt="Logo" width={40} height={40} />
          Nexora
        </Link>
        {children}

        <div className="text-balance text-center text-xs text-muted-foreground">
          By proceeding, you acknowledge that you have read and agree to our{" "}
          <span className="hover:text-primary text-underline">
            Terms of Service
          </span>{" "}
          and{" "}
          <span className="hover:text-primary text-underline">
            Privacy Policy
          </span>
          .
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
