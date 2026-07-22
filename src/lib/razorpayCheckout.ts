// Client helper: lazy-load Razorpay checkout.js and open the checkout modal.
// Enabled only when NEXT_PUBLIC_RAZORPAY_KEY_ID is set at build time.

declare global {
  interface Window {
    Razorpay?: new (opts: Record<string, unknown>) => { open: () => void; on: (e: string, cb: (r: unknown) => void) => void };
  }
}

export const isRazorpayEnabled = () => !!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

let scriptPromise: Promise<void> | null = null;
function loadScript(): Promise<void> {
  if (typeof window !== "undefined" && window.Razorpay) return Promise.resolve();
  scriptPromise ??= new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Could not load the payment window. Check your connection."));
    document.body.appendChild(s);
  });
  return scriptPromise;
}

export interface CheckoutResult {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export async function openRazorpayCheckout(opts: {
  keyId: string;
  orderId: string;
  amount: number; // paise
  currency: string;
  name: string;
  description: string;
  prefill?: { name?: string; email?: string; contact?: string };
}): Promise<CheckoutResult> {
  await loadScript();
  return new Promise<CheckoutResult>((resolve, reject) => {
    const Rzp = window.Razorpay!;
    const rzp = new Rzp({
      key: opts.keyId,
      order_id: opts.orderId,
      amount: opts.amount,
      currency: opts.currency,
      name: opts.name,
      description: opts.description,
      prefill: opts.prefill,
      theme: { color: "#fc536d" },
      handler: (resp: unknown) => resolve(resp as CheckoutResult),
      modal: { ondismiss: () => reject(new Error("Payment cancelled")) },
    });
    rzp.on("payment.failed", (resp: unknown) => {
      const desc = (resp as { error?: { description?: string } })?.error?.description;
      reject(new Error(desc || "Payment failed"));
    });
    rzp.open();
  });
}
