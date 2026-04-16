import { baseApi } from "./baseApi";
import type {
  ApiResponse,
  Transaction,
  WalletAddresses,
  Currency,
} from "../types";

export const transactionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDepositWallets: builder.query<ApiResponse<WalletAddresses>, void>({
      query: () => "/api/transactions/wallets",
      providesTags: ["Settings"],
    }),

    getTransaction: builder.query<ApiResponse<Transaction>, string>({
      query: (id) => `/api/transactions/${id}`,
    }),

    submitDeposit: builder.mutation<
      ApiResponse<Transaction>,
      { currency: Currency; amount: number; txHash?: string }
    >({
      query: (body) => ({
        url: "/api/transactions/deposit",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Transactions", "Balance"],
    }),

    submitWithdrawal: builder.mutation<
      ApiResponse<Transaction>,
      { currency: Currency; amount: number; walletAddress: string }
    >({
      query: (body) => ({
        url: "/api/transactions/withdraw",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Transactions", "Balance"],
    }),
  }),
});

export const {
  useGetDepositWalletsQuery,
  useGetTransactionQuery,
  useSubmitDepositMutation,
  useSubmitWithdrawalMutation,
} = transactionApi;
