import { quoteSchema } from "@/lib/dto/pricing";
import { resolveAndPrice } from "@/lib/services/quote";
import { ok, handleError } from "@/lib/http";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const input = quoteSchema.parse(await req.json());
    const result = await resolveAndPrice(input);
    return ok({ quote: result });
  } catch (err) {
    return handleError(err);
  }
}
