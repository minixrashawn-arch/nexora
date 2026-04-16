import { Request, Response } from "express";
import prisma from "../lib/prisma";

// ─── OVERVIEW STATS ───────────────────────────────────────────
export const getOverviewStats = async (req: Request, res: Response) => {
  try {
    const totalUsers = await prisma.user.count({
      where: { role: "USER" },
    });

    const totalDeposits = await prisma.transaction.aggregate({
      where: { type: "DEPOSIT", status: "APPROVED" },
      _sum: { amount: true },
      _count: true,
    });

    const totalWithdrawals = await prisma.transaction.aggregate({
      where: { type: "WITHDRAWAL", status: "APPROVED" },
      _sum: { amount: true },
      _count: true,
    });

    const pendingDeposits = await prisma.transaction.count({
      where: { type: "DEPOSIT", status: "PENDING" },
    });

    const pendingWithdrawals = await prisma.transaction.count({
      where: { type: "WITHDRAWAL", status: "PENDING" },
    });

    const settings = await prisma.siteSettings.findFirst();

    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalDeposits: {
          count: totalDeposits._count,
          amount: totalDeposits._sum.amount ?? 0,
        },
        totalWithdrawals: {
          count: totalWithdrawals._count,
          amount: totalWithdrawals._sum.amount ?? 0,
        },
        pendingDeposits,
        pendingWithdrawals,
        currentPrice: settings?.currentPrice ?? 0,
      },
    });
  } catch (error: any) {
    console.error("Get Overview Stats Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ─── GET ALL USERS ────────────────────────────────────────────
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      where: { role: "USER" },
      select: {
        id: true,
        name: true,
        email: true,
        nexoraBalance: true,
        isActive: true,
        createdAt: true,
        transactions: {
          select: {
            type: true,
            amount: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate total deposited and withdrawn per user
    const formatted = users.map((user) => {
      const totalDeposited = user.transactions
        .filter((t) => t.type === "DEPOSIT" && t.status === "APPROVED")
        .reduce((sum, t) => sum + t.amount, 0);

      const totalWithdrawn = user.transactions
        .filter((t) => t.type === "WITHDRAWAL" && t.status === "APPROVED")
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        nexoraBalance: user.nexoraBalance,
        isActive: user.isActive,
        createdAt: user.createdAt,
        totalDeposited: parseFloat(totalDeposited.toFixed(2)),
        totalWithdrawn: parseFloat(totalWithdrawn.toFixed(2)),
      };
    });

    return res.status(200).json({
      success: true,
      data: formatted,
    });
  } catch (error: any) {
    console.error("Get All Users Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ─── SUSPEND / ACTIVATE USER ──────────────────────────────────
export const toggleUserStatus = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (typeof id !== "string") {
    return res.status(400).json({
      success: false,
      message: "Invalid user ID",
    });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
      select: { id: true, name: true, isActive: true },
    });

    return res.status(200).json({
      success: true,
      message: `User ${updated.isActive ? "activated" : "suspended"} successfully`,
      data: updated,
    });
  } catch (error: any) {
    console.error("Toggle User Status Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ─── ADJUST USER BALANCE MANUALLY ─────────────────────────────
export const adjustUserBalance = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { amount, action } = req.body;
  // action: "ADD" or "SUBTRACT"

  if (typeof id !== "string") {
    return res.status(400).json({
      success: false,
      message: "Invalid user ID",
    });
  }

  if (!amount || !action) {
    return res.status(400).json({
      success: false,
      message: "Amount and action are required",
    });
  }

  if (!["ADD", "SUBTRACT"].includes(action)) {
    return res.status(400).json({
      success: false,
      message: "Action must be ADD or SUBTRACT",
    });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (action === "SUBTRACT" && user.nexoraBalance < amount) {
      return res.status(400).json({
        success: false,
        message: "User does not have enough balance to subtract",
      });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        nexoraBalance:
          action === "ADD"
            ? { increment: parseFloat(amount) }
            : { decrement: parseFloat(amount) },
      },
      select: { id: true, name: true, nexoraBalance: true },
    });

    return res.status(200).json({
      success: true,
      message: `Balance ${action === "ADD" ? "increased" : "decreased"} successfully`,
      data: updated,
    });
  } catch (error: any) {
    console.error("Adjust Balance Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ─── GET ALL DEPOSITS ─────────────────────────────────────────
export const getAllDeposits = async (req: Request, res: Response) => {
  const { status } = req.query;

  try {
    const deposits = await prisma.transaction.findMany({
      where: {
        type: "DEPOSIT",
        ...(status && { status: status as any }),
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({
      success: true,
      data: deposits,
    });
  } catch (error: any) {
    console.error("Get All Deposits Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ─── APPROVE DEPOSIT ──────────────────────────────────────────
export const approveDeposit = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (typeof id !== "string") {
    return res.status(400).json({
      success: false,
      message: "Invalid user ID",
    });
  }

  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    if (transaction.type !== "DEPOSIT") {
      return res.status(400).json({
        success: false,
        message: "This is not a deposit transaction",
      });
    }

    if (transaction.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: `Transaction already ${transaction.status.toLowerCase()}`,
      });
    }

    // Credit NEXORA to user and mark approved
    await prisma.$transaction([
      prisma.user.update({
        where: { id: transaction.userId },
        data: {
          nexoraBalance: {
            increment: transaction.nexoraAmount ?? 0,
          },
        },
      }),
      prisma.transaction.update({
        where: { id },
        data: { status: "APPROVED" },
      }),
    ]);

    return res.status(200).json({
      success: true,
      message: "Deposit approved, NEXORA credited to user",
    });
  } catch (error: any) {
    console.error("Approve Deposit Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ─── REJECT DEPOSIT ───────────────────────────────────────────
export const rejectDeposit = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (typeof id !== "string") {
    return res.status(400).json({
      success: false,
      message: "Invalid user ID",
    });
  }

  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    if (transaction.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: `Transaction already ${transaction.status.toLowerCase()}`,
      });
    }

    await prisma.transaction.update({
      where: { id },
      data: { status: "REJECTED" },
    });

    return res.status(200).json({
      success: true,
      message: "Deposit rejected",
    });
  } catch (error: any) {
    console.error("Reject Deposit Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ─── GET ALL WITHDRAWALS ──────────────────────────────────────
export const getAllWithdrawals = async (req: Request, res: Response) => {
  const { status } = req.query;

  try {
    const withdrawals = await prisma.transaction.findMany({
      where: {
        type: "WITHDRAWAL",
        ...(status && { status: status as any }),
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({
      success: true,
      data: withdrawals,
    });
  } catch (error: any) {
    console.error("Get All Withdrawals Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ─── APPROVE WITHDRAWAL ───────────────────────────────────────
export const approveWithdrawal = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (typeof id !== "string") {
    return res.status(400).json({
      success: false,
      message: "Invalid user ID",
    });
  }

  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    if (transaction.type !== "WITHDRAWAL") {
      return res.status(400).json({
        success: false,
        message: "This is not a withdrawal transaction",
      });
    }

    if (transaction.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: `Transaction already ${transaction.status.toLowerCase()}`,
      });
    }

    // Balance already deducted on submission so just mark approved
    await prisma.transaction.update({
      where: { id },
      data: { status: "APPROVED" },
    });

    return res.status(200).json({
      success: true,
      message: "Withdrawal approved. Remember to send the crypto manually.",
      data: {
        walletAddress: transaction.walletAddress,
        amount: transaction.amount,
        currency: transaction.currency,
      },
    });
  } catch (error: any) {
    console.error("Approve Withdrawal Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ─── REJECT WITHDRAWAL ────────────────────────────────────────
export const rejectWithdrawal = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (typeof id !== "string") {
    return res.status(400).json({
      success: false,
      message: "Invalid user ID",
    });
  }

  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    if (transaction.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: `Transaction already ${transaction.status.toLowerCase()}`,
      });
    }

    // Refund NEXORA back to user and mark rejected
    await prisma.$transaction([
      prisma.user.update({
        where: { id: transaction.userId },
        data: {
          nexoraBalance: {
            increment: transaction.nexoraAmount ?? 0,
          },
        },
      }),
      prisma.transaction.update({
        where: { id },
        data: { status: "REJECTED" },
      }),
    ]);

    return res.status(200).json({
      success: true,
      message: "Withdrawal rejected, NEXORA refunded to user",
    });
  } catch (error: any) {
    console.error("Reject Withdrawal Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ─── UPDATE PRICE ─────────────────────────────────────────────
export const updatePrice = async (req: Request, res: Response) => {
  const { price } = req.body;

  if (!price || price <= 0) {
    return res.status(400).json({
      success: false,
      message: "Valid price is required",
    });
  }

  try {
    // Update site settings
    const settings = await prisma.siteSettings.findFirst();

    if (!settings) {
      return res.status(404).json({
        success: false,
        message: "Site settings not found, run seed first",
      });
    }

    await prisma.siteSettings.update({
      where: { id: settings.id },
      data: { currentPrice: parseFloat(price) },
    });

    // Save to price history so chart updates
    await prisma.priceHistory.create({
      data: { price: parseFloat(price) },
    });

    return res.status(200).json({
      success: true,
      message: "Price updated successfully",
      data: { currentPrice: parseFloat(price) },
    });
  } catch (error: any) {
    console.error("Update Price Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ─── UPDATE WALLET ADDRESSES ──────────────────────────────────
export const updateWallets = async (req: Request, res: Response) => {
  const { usdtWallet, usdcWallet, btcWallet } = req.body;

  if (!usdtWallet && !usdcWallet && !btcWallet) {
    return res.status(400).json({
      success: false,
      message: "At least one wallet address is required",
    });
  }

  try {
    const settings = await prisma.siteSettings.findFirst();

    if (!settings) {
      return res.status(404).json({
        success: false,
        message: "Site settings not found, run seed first",
      });
    }

    const updated = await prisma.siteSettings.update({
      where: { id: settings.id },
      data: {
        ...(usdtWallet && { usdtWallet }),
        ...(usdcWallet && { usdcWallet }),
        ...(btcWallet && { btcWallet }),
      },
      select: {
        usdtWallet: true,
        usdcWallet: true,
        btcWallet: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Wallet addresses updated successfully",
      data: updated,
    });
  } catch (error: any) {
    console.error("Update Wallets Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ─── UPDATE SITE SETTINGS ─────────────────────────────────────
export const updateSiteSettings = async (req: Request, res: Response) => {
  const { totalSupply, volume, promoActive, promoText } = req.body;

  try {
    const settings = await prisma.siteSettings.findFirst();

    if (!settings) {
      return res.status(404).json({
        success: false,
        message: "Site settings not found, run seed first",
      });
    }

    const updated = await prisma.siteSettings.update({
      where: { id: settings.id },
      data: {
        ...(totalSupply !== undefined && {
          totalSupply: parseFloat(totalSupply),
        }),
        ...(volume !== undefined && { volume: parseFloat(volume) }),
        ...(promoActive !== undefined && { promoActive }),
        ...(promoText !== undefined && { promoText }),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Site settings updated successfully",
      data: updated,
    });
  } catch (error: any) {
    console.error("Update Site Settings Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ─── GET SITE SETTINGS ────────────────────────────────────────
export const getSiteSettings = async (req: Request, res: Response) => {
  try {
    const settings = await prisma.siteSettings.findFirst();

    return res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error: any) {
    console.error("Get Site Settings Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
