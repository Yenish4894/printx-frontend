import prisma from "@/lib/prisma";
import { HttpError } from "@/lib/http";
import { getSettings } from "./settings";
import {
  isRazorpayConfigured,
  razorpayKeyId,
  createRazorpayOrder,
  verifyPaymentSignature,
} from "@/lib/payments";
import type { WalletSettingsInput } from "@/lib/dto/wallet";

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

async function assertTopUpRange(amt: number) {
  const { minTopUp, maxTopUp } = await getSettings();
  if (amt < minTopUp) throw new HttpError(422, `Minimum top-up is ₹${minTopUp.toFixed(2)}`);
  if (amt > maxTopUp) throw new HttpError(422, `Maximum top-up is ₹${maxTopUp.toFixed(2)}`);
}

/**
 * Start an online top-up: create a Razorpay order + a PENDING payment row.
 * The client opens Razorpay checkout with the returned order, then calls verify.
 */
export async function createTopUpOrder(userId: string, amount: number) {
  if (!isRazorpayConfigured()) {
    throw new HttpError(503, "Online payments are not configured");
  }
  const amt = round2(amount);
  await assertTopUpRange(amt);

  const payment = await prisma.payment.create({
    data: { userId, purpose: "WALLET_TOPUP", method: "UPI", amount: amt, status: "PENDING" },
  });
  const order = await createRazorpayOrder(amt, payment.id);
  await prisma.payment.update({
    where: { id: payment.id },
    data: { razorpayOrderId: order.id },
  });

  return {
    keyId: razorpayKeyId(),
    orderId: order.id,
    amount: order.amount, // paise
    currency: order.currency,
    paymentId: payment.id,
  };
}

/**
 * Verify a completed Razorpay payment and credit the wallet exactly once.
 * The PENDING→SUCCESS transition is atomic (updateMany guard) so a replayed
 * callback can never double-credit.
 */
export async function verifyTopUp(
  userId: string,
  input: { razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string },
) {
  if (!verifyPaymentSignature(input.razorpayOrderId, input.razorpayPaymentId, input.razorpaySignature)) {
    throw new HttpError(400, "Payment verification failed");
  }
  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findFirst({
      where: { userId, razorpayOrderId: input.razorpayOrderId, purpose: "WALLET_TOPUP" },
    });
    if (!payment) throw new HttpError(404, "Payment not found");

    // Atomically claim this payment; a second callback finds count 0 and no-ops.
    const claimed = await tx.payment.updateMany({
      where: { id: payment.id, status: "PENDING" },
      data: { status: "SUCCESS", razorpayPaymentId: input.razorpayPaymentId },
    });
    if (claimed.count === 0) {
      // Already processed — return the current balance idempotently.
      const u = await tx.user.findUnique({ where: { id: userId }, select: { walletBalance: true } });
      return { balance: Number(u?.walletBalance ?? 0), credited: 0, alreadyProcessed: true };
    }

    const amt = round2(Number(payment.amount));
    const user = await tx.user.update({
      where: { id: userId },
      data: { walletBalance: { increment: amt } },
    });
    const newBalance = Number(user.walletBalance);
    await tx.walletTransaction.create({
      data: {
        userId,
        type: "CREDIT",
        amount: amt,
        balanceAfter: newBalance,
        reference: input.razorpayPaymentId,
        description: "Wallet top-up (online)",
      },
    });
    await tx.notification.create({
      data: {
        userId,
        type: "WALLET",
        title: "Wallet topped up",
        body: `₹${amt.toFixed(2)} added. New balance ₹${newBalance.toFixed(2)}.`,
      },
    });
    return { balance: newBalance, credited: amt, alreadyProcessed: false };
  });
}

/**
 * Manual wallet top-up — DEV/fallback only. Blocked once Razorpay is configured
 * so production always goes through the real gateway. Credits directly.
 */
export async function topUpWallet(userId: string, amount: number) {
  if (isRazorpayConfigured()) {
    throw new HttpError(400, "Please use online payment to top up your wallet");
  }
  const amt = round2(amount);
  await assertTopUpRange(amt);
  return prisma.$transaction(async (tx) => {
    // Atomic increment — safe against concurrent top-ups (no lost updates).
    const user = await tx.user.update({
      where: { id: userId },
      data: { walletBalance: { increment: amt } },
    });
    const newBalance = Number(user.walletBalance);
    await tx.walletTransaction.create({
      data: {
        userId,
        type: "CREDIT",
        amount: amt,
        balanceAfter: newBalance,
        description: "Wallet top-up",
      },
    });
    await tx.notification.create({
      data: {
        userId,
        type: "WALLET",
        title: "Wallet topped up",
        body: `₹${amt.toFixed(2)} added. New balance ₹${newBalance.toFixed(2)}.`,
      },
    });
    return { balance: newBalance, credited: amt };
  });
}

/** Update the user's wallet preferences (auto top-up, alerts, spend limit). */
export async function updateWalletSettings(
  userId: string,
  input: WalletSettingsInput,
) {
  const s = await prisma.walletSettings.upsert({
    where: { userId },
    create: { userId, ...input },
    update: { ...input },
  });
  return {
    autoTopUp: s.autoTopUp,
    autoTopUpThreshold: Number(s.autoTopUpThreshold),
    autoTopUpAmount: Number(s.autoTopUpAmount),
    transactionAlerts: s.transactionAlerts,
    lowBalanceAlert: s.lowBalanceAlert,
    lowBalanceThreshold: Number(s.lowBalanceThreshold),
    monthlySpendingLimit:
      s.monthlySpendingLimit == null ? null : Number(s.monthlySpendingLimit),
  };
}

/** Wallet overview: balance + settings. */
export async function getWallet(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { walletSettings: true },
  });
  if (!user) throw new HttpError(401, "Not authenticated");

  const s = user.walletSettings;
  return {
    balance: Number(user.walletBalance),
    settings: s
      ? {
          autoTopUp: s.autoTopUp,
          autoTopUpThreshold: Number(s.autoTopUpThreshold),
          autoTopUpAmount: Number(s.autoTopUpAmount),
          transactionAlerts: s.transactionAlerts,
          lowBalanceAlert: s.lowBalanceAlert,
          lowBalanceThreshold: Number(s.lowBalanceThreshold),
          monthlySpendingLimit:
            s.monthlySpendingLimit == null
              ? null
              : Number(s.monthlySpendingLimit),
        }
      : null,
  };
}

/** Wallet ledger, newest first. */
export async function listTransactions(userId: string, limit = 50) {
  const txns = await prisma.walletTransaction.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return txns.map((t) => ({
    id: t.id,
    type: t.type,
    amount: Number(t.amount),
    balanceAfter: Number(t.balanceAfter),
    reference: t.reference,
    description: t.description,
    relatedOrderId: t.relatedOrderId,
    createdAt: t.createdAt,
  }));
}
