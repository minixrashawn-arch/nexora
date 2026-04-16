import { Request, Response } from "express";
import prisma from "../lib/prisma";

// ─── SUBMIT DEPOSIT REQUEST ───────────────────────────────────
export const submitDeposit = async (req: Request, res: Response) => {
  const { currency, amount, txHash } = req.body;

  if (!currency || !amount) {
    return res.status(400).json({
      success: false,
      message: "Currency and amount are required",
    });
  }

  if (!["USDT", "USDC", "BTC"].includes(currency)) {
    return res.status(400).json({
      success: false,
      message: "Invalid currency. Must be USDT, USDC or BTC",
    });
  }

  if (amount <= 0) {
    return res.status(400).json({
      success: false,
      message: "Amount must be greater than 0",
    });
  }

  try {
    // Get current price to calculate nexora amount
    const settings = await prisma.siteSettings.findFirst();
    const currentPrice = settings?.currentPrice ?? 0;

    if (currentPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: "Current price not set, contact admin",
      });
    }

    // Calculate how much NEXORA they will receive
    // For BTC we need a conversion - for now treat 1 BTC = $60000
    // Admin will manually verify and set the actual nexora amount on approval
    let usdEquivalent = amount;
    if (currency === "BTC") {
      usdEquivalent = amount * 60000;
    }

    const nexoraAmount = parseFloat((usdEquivalent / currentPrice).toFixed(4));

    const transaction = await prisma.transaction.create({
      data: {
        userId: req.user!.id,
        type: "DEPOSIT",
        currency,
        amount: parseFloat(amount),
        nexoraAmount,
        txHash: txHash || null,
        status: "PENDING",
      },
    });

    return res.status(201).json({
      success: true,
      message: "Deposit request submitted, pending admin approval",
      data: transaction,
    });
  } catch (error: any) {
    console.error("Submit Deposit Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ─── SUBMIT WITHDRAWAL REQUEST ────────────────────────────────
export const submitWithdrawal = async (req: Request, res: Response) => {
  const { currency, amount, walletAddress } = req.body;

  if (!currency || !amount || !walletAddress) {
    return res.status(400).json({
      success: false,
      message: "Currency, amount and wallet address are required",
    });
  }

  if (!["USDT", "USDC", "BTC"].includes(currency)) {
    return res.status(400).json({
      success: false,
      message: "Invalid currency",
    });
  }

  if (amount <= 0) {
    return res.status(400).json({
      success: false,
      message: "Amount must be greater than 0",
    });
  }

  try {
    // Check user has enough NEXORA balance
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { nexoraBalance: true },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get current price
    const settings = await prisma.siteSettings.findFirst();
    const currentPrice = settings?.currentPrice ?? 0;

    // Calculate nexora equivalent of withdrawal amount
    let usdEquivalent = amount;
    if (currency === "BTC") {
      usdEquivalent = amount * 60000;
    }

    const nexoraRequired = parseFloat(
      (usdEquivalent / currentPrice).toFixed(4),
    );

    if (user.nexoraBalance < nexoraRequired) {
      return res.status(400).json({
        success: false,
        message: "Insufficient NEXORA balance",
      });
    }

    // Deduct balance immediately and hold pending approval
    await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        nexoraBalance: {
          decrement: nexoraRequired,
        },
      },
    });

    const transaction = await prisma.transaction.create({
      data: {
        userId: req.user!.id,
        type: "WITHDRAWAL",
        currency,
        amount: parseFloat(amount),
        nexoraAmount: nexoraRequired,
        walletAddress,
        status: "PENDING",
      },
    });

    return res.status(201).json({
      success: true,
      message: "Withdrawal request submitted, pending admin approval",
      data: transaction,
    });
  } catch (error: any) {
    console.error("Submit Withdrawal Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ─── GET DEPOSIT WALLET ADDRESSES ────────────────────────────
export const getDepositWallets = async (req: Request, res: Response) => {
  try {
    const settings = await prisma.siteSettings.findFirst({
      select: {
        usdtWallet: true,
        usdcWallet: true,
        btcWallet: true,
      },
    });

    if (!settings) {
      return res.status(404).json({
        success: false,
        message: "Wallet addresses not configured yet",
      });
    }

    return res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error: any) {
    console.error("Get Wallets Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ─── GET SINGLE TRANSACTION ───────────────────────────────────
export const getTransaction = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (typeof id !== "string") {
    return res.status(400).json({
      success: false,
      message: "Invalid transaction ID",
    });
  }

  try {
    const transaction = await prisma.transaction.findFirst({
      where: {
        id,
        userId: req.user!.id, // ensure user owns this transaction
      },
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error: any) {
    console.error("Get Transaction Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
