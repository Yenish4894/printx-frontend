import { requireUser } from "@/lib/auth";
import { listAddresses, createAddress } from "@/lib/services/address";
import { addressSchema } from "@/lib/dto/address";
import { ok, handleError } from "@/lib/http";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await requireUser();
    return ok({ addresses: await listAddresses(user.id) });
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const data = addressSchema.parse(await req.json());
    const address = await createAddress(user.id, data);
    return ok({ address }, 201);
  } catch (err) {
    return handleError(err);
  }
}
