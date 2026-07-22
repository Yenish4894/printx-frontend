import { z } from "zod";
import { quoteSchema } from "./pricing";

export const addCartItemSchema = quoteSchema.extend({
  notes: z.string().max(500).optional(),
});

export const updateCartItemSchema = z.object({
  quantity: z
    .number()
    .int()
    .positive()
    .max(1_000_000, "Quantity is too large (max 1,000,000)"),
});

export type AddCartItemInput = z.infer<typeof addCartItemSchema>;
