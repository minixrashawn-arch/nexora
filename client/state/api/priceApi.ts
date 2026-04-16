import { baseApi } from "./baseApi";
import type {
  ApiResponse,
  CurrentPrice,
  PriceHistory,
  PriceRange,
} from "../types";

export const priceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCurrentPrice: builder.query<ApiResponse<CurrentPrice>, void>({
      query: () => "/api/price/current",
      providesTags: ["Price"],
    }),

    getPriceHistory: builder.query<ApiResponse<PriceHistory>, PriceRange>({
      query: (range) => `/api/price/history/${range}`,
      providesTags: (_result, _error, range) => [
        { type: "PriceHistory", id: range },
      ],
    }),
  }),
});

export const { useGetCurrentPriceQuery, useGetPriceHistoryQuery } = priceApi;
