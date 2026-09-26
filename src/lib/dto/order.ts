import { z } from "zod";

export const placeOrderSchema = z.object({
  addressId: z.string().min(1, "Select a delivery address"),
  notes: z.string().max(500).optional(),
});

