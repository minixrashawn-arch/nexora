import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../redux";

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
    prepareHeaders: (headers, { getState }) => {
      // First try Redux store
      let token = (getState() as RootState).auth.token;

      // Fallback to localStorage (on refresh before rehydration)
      if (!token && typeof window !== "undefined") {
        token = localStorage.getItem("token");
      }

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),
  tagTypes: [
    "User",
    "Balance",
    "Transactions",
    "Price",
    "PriceHistory",
    "AdminUsers",
    "AdminDeposits",
    "AdminWithdrawals",
    "Settings",
  ],
  endpoints: () => ({}),
});
