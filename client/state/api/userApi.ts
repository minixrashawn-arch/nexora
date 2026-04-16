import { baseApi } from "./baseApi";
import type { ApiResponse, User, UserBalance, Transaction } from "../types";

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProfile: builder.query<ApiResponse<User>, void>({
      query: () => "/api/user/profile",
      providesTags: ["User"],
    }),

    getBalance: builder.query<ApiResponse<UserBalance>, void>({
      query: () => "/api/user/balance",
      providesTags: ["Balance"],
    }),

    getTransactionHistory: builder.query<ApiResponse<Transaction[]>, void>({
      query: () => "/api/user/transactions",
      providesTags: ["Transactions"],
    }),

    updateProfile: builder.mutation<ApiResponse<User>, { name: string }>({
      query: (body) => ({
        url: "/api/user/profile",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["User"],
    }),

    changePassword: builder.mutation<
      ApiResponse<null>,
      {
        currentPassword: string;
        newPassword: string;
        confirmPassword: string;
      }
    >({
      query: (body) => ({
        url: "/api/user/change-password",
        method: "PUT",
        body,
      }),
    }),
  }),
});

export const {
  useGetProfileQuery,
  useGetBalanceQuery,
  useGetTransactionHistoryQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
} = userApi;
