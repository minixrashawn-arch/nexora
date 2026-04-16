// ─── USER ─────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  nexoraBalance: number;
  isActive: boolean;
  createdAt: string;
}

export interface UserBalance {
  nexoraBalance: number;
  currentPrice: number;
  portfolioValue: number;
}

// ─── TRANSACTIONS ─────────────────────────────────────────────
export type TransactionType = "DEPOSIT" | "WITHDRAWAL";
export type TransactionStatus = "PENDING" | "APPROVED" | "REJECTED";
export type Currency = "USDT" | "USDC" | "BTC";

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  currency: Currency;
  amount: number;
  nexoraAmount: number | null;
  txHash: string | null;
  walletAddress: string | null;
  status: TransactionStatus;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

// ─── PRICE ────────────────────────────────────────────────────
export interface CurrentPrice {
  currentPrice: number;
  change24h: number;
  volume: number;
  marketCap: number;
  totalSupply: number;
}

export interface PricePoint {
  price: number;
  time: string;
}

export type PriceRange = "24H" | "7D" | "30D" | "90D" | "1Y";

export interface PriceHistory {
  history: PricePoint[];
  high: number;
  low: number;
  open: number;
  change: number;
}

// ─── SITE SETTINGS ────────────────────────────────────────────
export interface SiteSettings {
  id: string;
  usdtWallet: string;
  usdcWallet: string;
  btcWallet: string;
  totalSupply: number;
  volume: number;
  marketCap: number;
  currentPrice: number;
  promoActive: boolean;
  promoText: string;
}

export interface WalletAddresses {
  usdtWallet: string;
  usdcWallet: string;
  btcWallet: string;
}

// ─── ADMIN ────────────────────────────────────────────────────
export interface AdminUser extends User {
  totalDeposited: number;
  totalWithdrawn: number;
}

export interface OverviewStats {
  totalUsers: number;
  totalDeposits: {
    count: number;
    amount: number;
  };
  totalWithdrawals: {
    count: number;
    amount: number;
  };
  pendingDeposits: number;
  pendingWithdrawals: number;
  currentPrice: number;
}

// ─── API RESPONSE WRAPPER ─────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

// ─── AUTH ─────────────────────────────────────────────────────
export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface VerifyOTPPayload {
  email: string;
  otp: string;
}

export interface ResetPasswordPayload {
  email: string;
  newPassword: string;
  confirmPassword: string;
}
