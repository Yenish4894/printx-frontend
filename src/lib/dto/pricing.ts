import { z } from "zod";

export const quoteSchema = z.object({
  productId: z.string().min(1),
  quantity: z
    .number()
    .int()
    .positive()
    .max(1_000_000, "Quantity is too large (max 1,000,000)"),
  width: z.number().positive().max(100000).optional(),
  height: z.number().positive().max(100000).optional(),
  deliverySpeedId: z.string().optional(),
  // group id → selected option id (SINGLE) or option ids (MULTI)
  selections: z
    .record(z.string(), z.union([z.string(), z.array(z.string())]))
    .default({}),
});

export type QuoteInput = z.infer<typeof quoteSchema>;
