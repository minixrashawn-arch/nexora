import { baseApi } from "./baseApi";
import type {
  ApiResponse,
  AdminUser,
  OverviewStats,
  Transaction,
  SiteSettings,
  WalletAddresses,
  TransactionStatus,
} from "../types";

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOverviewStats: builder.query<ApiResponse<OverviewStats>, void>({
      query: () => "/api/admin/stats",
      providesTags: ["AdminDeposits", "AdminWithdrawals", "AdminUsers"],
    }),

    getAllUsers: builder.query<ApiResponse<AdminUser[]>, void>({
      query: () => "/api/admin/users",
      providesTags: ["AdminUsers"],
    }),

    toggleUserStatus: builder.mutation<ApiResponse<AdminUser>, string>({
      query: (id) => ({
        url: `/api/admin/users/${id}/toggle-status`,
        method: "PATCH",
      }),
      invalidatesTags: ["AdminUsers"],
    }),

    adjustUserBalance: builder.mutation<
      ApiResponse<AdminUser>,
      { id: string; amount: number; action: "ADD" | "SUBTRACT" }
    >({
      query: ({ id, ...body }) => ({
        url: `/api/admin/users/${id}/balance`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["AdminUsers"],
    }),

    getAllDeposits: builder.query<
      ApiResponse<Transaction[]>,
      TransactionStatus | void
    >({
      query: (status) =>
        status ? `/api/admin/deposits?status=${status}` : "/api/admin/deposits",
      providesTags: ["AdminDeposits"],
    }),

    approveDeposit: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `/api/admin/deposits/${id}/approve`,
        method: "PATCH",
      }),
      invalidatesTags: ["AdminDeposits", "AdminUsers", "Balance"],
    }),

    rejectDeposit: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `/api/admin/deposits/${id}/reject`,
        method: "PATCH",
      }),
      invalidatesTags: ["AdminDeposits"],
    }),

    getAllWithdrawals: builder.query<
      ApiResponse<Transaction[]>,
      TransactionStatus | void
    >({
      query: (status) =>
        status
          ? `/api/admin/withdrawals?status=${status}`
          : "/api/admin/withdrawals",
      providesTags: ["AdminWithdrawals"],
    }),

    approveWithdrawal: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `/api/admin/withdrawals/${id}/approve`,
        method: "PATCH",
      }),
      invalidatesTags: ["AdminWithdrawals"],
    }),

    rejectWithdrawal: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `/api/admin/withdrawals/${id}/reject`,
        method: "PATCH",
      }),
      invalidatesTags: ["AdminWithdrawals", "AdminUsers"],
    }),

    updatePrice: builder.mutation<ApiResponse<null>, { price: number }>({
      query: (body) => ({
        url: "/api/admin/price",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Price", "PriceHistory", "Settings"],
    }),

    updateWallets: builder.mutation<
      ApiResponse<WalletAddresses>,
      Partial<WalletAddresses>
    >({
      query: (body) => ({
        url: "/api/admin/wallets",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Settings"],
    }),

    getSiteSettings: builder.query<ApiResponse<SiteSettings>, void>({
      query: () => "/api/admin/settings",
      providesTags: ["Settings"],
    }),

    updateSiteSettings: builder.mutation<
      ApiResponse<SiteSettings>,
      Partial<SiteSettings>
    >({
      query: (body) => ({
        url: "/api/admin/settings",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Settings", "Price"],
    }),
  }),
});

export const {
  useGetOverviewStatsQuery,
  useGetAllUsersQuery,
  useToggleUserStatusMutation,
  useAdjustUserBalanceMutation,
  useGetAllDepositsQuery,
  useApproveDepositMutation,
  useRejectDepositMutation,
  useGetAllWithdrawalsQuery,
  useApproveWithdrawalMutation,
  useRejectWithdrawalMutation,
  useUpdatePriceMutation,
  useUpdateWalletsMutation,
  useGetSiteSettingsQuery,
  useUpdateSiteSettingsMutation,
} = adminApi;
