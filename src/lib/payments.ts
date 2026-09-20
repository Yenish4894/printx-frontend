// Razorpay payment seam. Real online top-ups when keys are configured; the app
// falls back to manual instant credit (dev) when they are not.
//
// Talks to Razorpay's REST API over fetch (NOT the Node SDK) so it runs on
// Cloudflare Workers and keeps the Worker bundle small.
import crypto from "node:crypto";

// Read lazily, never at module-eval time. On Workers the env is injected into
// process.env per request, so a const captured at import can be undefined
// forever — and here that misreads as "Razorpay not configured", which is the
// branch that hands out free wallet credit. auth.ts reads JWT_SECRET lazily for
// the same reason.
const keyId = () => process.env.RAZORPAY_KEY_ID;
const keySecret = () => process.env.RAZORPAY_KEY_SECRET;
const API = "https://api.razorpay.com/v1";

export const isRazorpayConfigured = () => !!(keyId() && keySecret());
export const razorpayKeyId = () => keyId() ?? null;

function authHeader(): string {
  return "Basic " + Buffer.from(`${keyId()}:${keySecret()}`).toString("base64");
}

/** Create a Razorpay order. `amount` is in rupees; Razorpay wants paise. */
export async function createRazorpayOrder(amountRupees: number, receipt: string) {
  if (!isRazorpayConfigured()) throw new Error("Razorpay is not configured");
  const res = await fetch(`${API}/orders`, {
    method: "POST",
    headers: { Authorization: authHeader(), "Content-Type": "application/json" },
    body: JSON.stringify({ amount: Math.round(amountRupees * 100), currency: "INR", receipt }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Razorpay order creation failed (${res.status}): ${detail}`);
  }
  const order = (await res.json()) as { id: string; amount: number | string; currency: string };
  return { id: order.id, amount: Number(order.amount), currency: order.currency };
}

/** Verify the checkout callback signature (HMAC-SHA256 of "order_id|payment_id"). */
export function verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean {
  const secret = keySecret();
  if (!secret) return false;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  // timing-safe compare
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
