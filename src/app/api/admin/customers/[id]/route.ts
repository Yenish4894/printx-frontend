import { requireAdmin } from "@/lib/auth";
import { getCustomer, setCustomerActive } from "@/lib/services/admin/customers";
import { customerUpdateSchema } from "@/lib/dto/admin";
import { ok, handleError, HttpError } from "@/lib/http";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    return ok({ customer: await getCustomer(id) });
  } catch (err) {
    return handleError(err);
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const input = customerUpdateSchema.parse(await req.json());
    if (typeof input.isActive !== "boolean") {
      throw new HttpError(422, "Nothing to update");
    }
    return ok({ customer: await setCustomerActive(id, input.isActive) });
  } catch (err) {
    return handleError(err);
  }
}
