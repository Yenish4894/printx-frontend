import { z } from "zod";

// Top-up amount (min/max range enforced against PlatformSettings in the service).
export const topUpSchema = z.object({
  amount: z.number().positive("Enter an amount greater than zero"),
});

// Razorpay checkout callback payload.
export const verifyTopUpSchema = z.object({
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});

export const walletSettingsSchema = z.object({
  autoTopUp: z.boolean().optional(),
  autoTopUpThreshold: z.number().nonnegative().optional(),
  autoTopUpAmount: z.number().nonnegative().optional(),
  transactionAlerts: z.boolean().optional(),
  lowBalanceAlert: z.boolean().optional(),
  lowBalanceThreshold: z.number().nonnegative().optional(),
  monthlySpendingLimit: z.number().nonnegative().nullable().optional(),
});

export type TopUpInput = z.infer<typeof topUpSchema>;
export type WalletSettingsInput = z.infer<typeof walletSettingsSchema>;
