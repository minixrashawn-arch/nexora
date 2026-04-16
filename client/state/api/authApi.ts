import {
  ApiResponse,
  AuthResponse,
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
  VerifyOTPPayload,
} from "../types";
import { baseApi } from "./baseApi";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<ApiResponse<AuthResponse>, RegisterPayload>({
      query: (body) => ({
        url: "/api/auth/register",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),

    login: builder.mutation<ApiResponse<AuthResponse>, LoginPayload>({
      query: (body) => ({
        url: "/api/auth/login",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),

    logout: builder.mutation<ApiResponse<null>, void>({
      query: () => ({
        url: "/api/auth/logout",
        method: "POST",
      }),
      invalidatesTags: ["User"],
    }),

    forgotPassword: builder.mutation<ApiResponse<null>, ForgotPasswordPayload>({
      query: (body) => ({
        url: "/api/auth/forgot-password",
        method: "POST",
        body,
      }),
    }),

    verifyOTP: builder.mutation<ApiResponse<null>, VerifyOTPPayload>({
      query: (body) => ({
        url: "/api/auth/verify-otp",
        method: "POST",
        body,
      }),
    }),

    resetPassword: builder.mutation<ApiResponse<null>, ResetPasswordPayload>({
      query: (body) => ({
        url: "/api/auth/reset-password",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useForgotPasswordMutation,
  useVerifyOTPMutation,
  useResetPasswordMutation,
} = authApi;
