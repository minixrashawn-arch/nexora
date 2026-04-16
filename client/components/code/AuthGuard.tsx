"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/state/redux";
import {
  selectCurrentUser,
  selectIsAuthenticated,
  setCredentials,
} from "@/state/slice/authSlice";
import { useGetProfileQuery } from "@/state/api/userApi";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function AuthGuard({ children, requireAdmin = false }: AuthGuardProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectCurrentUser);
  const [checked, setChecked] = useState(false);

  // If we have a token but no user (page refresh), fetch profile
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const { data: profileData } = useGetProfileQuery(undefined, {
    skip: !token || !!user,
  });

  useEffect(() => {
    // Restore user from profile if Redux was cleared on refresh
    if (profileData?.data && !user) {
      dispatch(
        setCredentials({
          user: profileData.data,
          accessToken: token!,
        }),
      );
    }
  }, [profileData, user, dispatch, token]);

  React.useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    // Decode role from token
    try {
      const payload = JSON.parse(
        Buffer.from(token.split(".")[1], "base64").toString(),
      );

      const role: string = payload.userRole;
      const isExpired = payload.exp * 1000 < Date.now();

      if (isExpired) {
        localStorage.removeItem("token");
        router.replace("/login");
        return;
      }

      if (requireAdmin && role !== "ADMIN") {
        router.replace("/user/dashboard/home");
        return;
      }

      if (!requireAdmin && role === "ADMIN") {
        router.replace("/admin/dashboard/home");
        return;
      }

      setChecked(true);
    } catch {
      localStorage.removeItem("token");
      router.replace("/login");
    }
  }, [requireAdmin, router]);

  if (!checked) return null;

  return <>{children}</>;
}
