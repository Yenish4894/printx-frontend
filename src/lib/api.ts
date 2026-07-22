// Browser-side API client. Thin typed wrappers over the Route Handlers.
// Same-origin cookies carry the session, so every call uses credentials: "include".

/** camelCase field name → human label for validation messages. */
function prettyField(f: string) {
  const map: Record<string, string> = {
    pincode: "PIN code",
    phone: "Phone",
    line1: "Address line 1",
    line2: "Address line 2",
    businessName: "Business name",
    ownerName: "Owner name",
    gstNumber: "GST number",
    mobile: "Mobile",
    label: "Label",
    name: "Name",
    city: "City",
    state: "State",
    email: "Email",
    password: "Password",
    quantity: "Quantity",
    amount: "Amount",
  };
  return map[f] ?? f.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public issues?: unknown,
  ) {
    super(message);
  }
}

async function req<T = unknown>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const opts: RequestInit = { method, credentials: "include" };
  if (body instanceof FormData) {
    opts.body = body;
  } else if (body !== undefined) {
    opts.headers = { "Content-Type": "application/json" };
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(`/api${path}`, opts);
  const text = await res.text();
  let json: unknown = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = text;
  }
  if (!res.ok) {
    const body = json as {
      error?: string;
      issues?: { fieldErrors?: Record<string, string[]>; formErrors?: string[] };
    };
    let msg = body?.error ?? `Request failed (${res.status})`;
    // Surface WHICH field failed instead of a bare "Validation failed".
    const fieldErrors = body?.issues?.fieldErrors;
    if (fieldErrors) {
      const parts = Object.entries(fieldErrors)
        .filter(([, v]) => v?.length)
        .map(([field, msgs]) => `${prettyField(field)}: ${msgs[0]}`);
      if (parts.length) msg = parts.join(" · ");
    }
    throw new ApiError(res.status, msg, body?.issues);
  }
  return json as T;
}

const get = <T>(p: string) => req<T>("GET", p);
const post = <T>(p: string, b?: unknown) => req<T>("POST", p, b);
const patch = <T>(p: string, b?: unknown) => req<T>("PATCH", p, b);
const put = <T>(p: string, b?: unknown) => req<T>("PUT", p, b);
const del = <T>(p: string) => req<T>("DELETE", p);

// ───────────────────────── Types (loose; mirror serializers) ─────────────────────────
export type Money = number;
export interface SessionUser {
  id: string;
  businessName: string;
  ownerName: string;
  mobile: string;
  email: string;
  gstNumber?: string | null;
  role: "CUSTOMER" | "ADMIN" | "SUPER_ADMIN";
  walletBalance: Money;
}

export interface PriceBreakdown {
  units: number;
  base: Money;
  addOns: Money;
  delivery: Money;
  goodsTaxable: Money;
  goodsGst: Money;
  deliveryGst: Money;
  taxable: Money;
  gst: Money;
  total: Money;
  gstInclusive: boolean;
}

// ───────────────────────── Auth ─────────────────────────
export const auth = {
  login: (mobile: string, password: string) =>
    post<{ user: SessionUser }>("/auth/login", { mobile, password }),
  register: (data: Record<string, unknown>) =>
    post<{ user: SessionUser }>("/auth/register", data),
  logout: () => post("/auth/logout"),
  me: () => get<{ user: SessionUser | null }>("/auth/me"),
};

// ───────────────────────── Catalog (customer) ─────────────────────────
export const catalog = {
  products: (category?: string) =>
    get<{ products: unknown[] }>(`/products${category ? `?category=${category}` : ""}`),
  product: (slug: string) => get<{ product: Record<string, any> }>(`/products/${slug}`),
  quote: (input: {
    productId: string;
    quantity: number;
    selections: Record<string, string | string[]>;
    width?: number;
    height?: number;
    deliverySpeedId?: string;
  }) => post<{ quote: { breakdown: PriceBreakdown; specSnapshot: unknown; deliveryLabel: string | null } }>("/pricing/quote", input),
};

// ───────────────────────── Cart ─────────────────────────
export const cart = {
  get: () => get<any>("/cart"),
  add: (input: Record<string, unknown>) => post<any>("/cart/items", input),
  updateQty: (id: string, quantity: number) => patch<any>(`/cart/items/${id}`, { quantity }),
  remove: (id: string) => del<any>(`/cart/items/${id}`),
  uploadFile: (id: string, file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return post<any>(`/cart/items/${id}/file`, fd);
  },
};

// ───────────────────────── Addresses ─────────────────────────
export const addresses = {
  list: () => get<{ addresses: any[] }>("/me/addresses"),
  create: (input: Record<string, unknown>) => post<any>("/me/addresses", input),
};

// ───────────────────────── Wallet ─────────────────────────
export const wallet = {
  get: () => get<any>("/wallet"),
  transactions: () => get<{ transactions?: any[] } | any[]>("/wallet/transactions"),
  // Manual/dev top-up (used only when Razorpay is not configured).
  topUp: (amount: number) => post<{ wallet: { balance: Money; credited: Money } }>("/wallet/topup", { amount }),
  // Razorpay online top-up: create an order, then verify after checkout.
  createTopUpOrder: (amount: number) =>
    post<{ keyId: string; orderId: string; amount: number; currency: string; paymentId: string }>(
      "/wallet/topup/order",
      { amount },
    ),
  verifyTopUp: (payload: { razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string }) =>
    post<{ wallet: { balance: Money; credited: Money; alreadyProcessed: boolean } }>("/wallet/topup/verify", payload),
  updateSettings: (settings: Record<string, unknown>) => patch<any>("/wallet", settings),
};

// ───────────────────────── Orders ─────────────────────────
export const orders = {
  list: () => get<{ orders: any[] }>("/orders"),
  get: (id: string) => get<{ order: any }>(`/orders/${id}`),
  place: (addressId: string, notes?: string) =>
    post<{ order: any }>("/orders", { addressId, notes }),
  cancel: (id: string, reason?: string) => post<{ order: any }>(`/orders/${id}/cancel`, { reason }),
  uploadItemFile: (id: string, itemId: string, file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return post<any>(`/orders/${id}/items/${itemId}/file`, fd);
  },
};

// ───────────────────────── Admin ─────────────────────────
export const admin = {
  stats: () => get<{ stats: any }>("/admin/stats"),

  categories: {
    list: () => get<{ categories: any[] }>("/admin/categories"),
    create: (input: Record<string, unknown>) => post<any>("/admin/categories", input),
    update: (id: string, input: Record<string, unknown>) => patch<any>(`/admin/categories/${id}`, input),
    remove: (id: string) => del<any>(`/admin/categories/${id}`),
  },

  products: {
    list: () => get<{ products: any[] }>("/admin/products"),
    get: (id: string) => get<{ product: any }>(`/admin/products/${id}`),
    create: (input: Record<string, unknown>) => post<{ product: { id: string; slug: string } }>("/admin/products", input),
    update: (id: string, input: Record<string, unknown>) => patch<any>(`/admin/products/${id}`, input),
    remove: (id: string) => del<any>(`/admin/products/${id}`),
    addSpecGroup: (id: string, input: Record<string, unknown>) => post<any>(`/admin/products/${id}/spec-groups`, input),
    setTiers: (id: string, tiers: unknown[]) => put<any>(`/admin/products/${id}/tiers`, { tiers }),
    setDelivery: (id: string, speeds: unknown[]) => put<any>(`/admin/products/${id}/delivery`, { speeds }),
    getMatrix: (id: string) => get<{ matrix: any }>(`/admin/products/${id}/matrix`),
    setMatrix: (id: string, rows: unknown[]) => put<any>(`/admin/products/${id}/matrix`, { rows }),
  },

  specGroups: {
    update: (id: string, input: Record<string, unknown>) => patch<any>(`/admin/spec-groups/${id}`, input),
    remove: (id: string) => del<any>(`/admin/spec-groups/${id}`),
    addOption: (id: string, input: Record<string, unknown>) => post<any>(`/admin/spec-groups/${id}/options`, input),
  },
  specOptions: {
    update: (id: string, input: Record<string, unknown>) => patch<any>(`/admin/spec-options/${id}`, input),
    remove: (id: string) => del<any>(`/admin/spec-options/${id}`),
  },

  orders: {
    list: (status?: string) => get<{ orders: any[] }>(`/admin/orders${status ? `?status=${status}` : ""}`),
    get: (id: string) => get<{ order: any }>(`/admin/orders/${id}`),
    setStatus: (id: string, status: string, note?: string) => patch<any>(`/admin/orders/${id}/status`, { status, note }),
    reviewFile: (id: string, itemId: string, action: "APPROVE" | "REJECT", reason?: string) =>
      patch<any>(`/admin/orders/${id}/items/${itemId}/review`, { action, reason }),
  },

  customers: {
    list: () => get<{ customers: any[] }>("/admin/customers"),
    get: (id: string) => get<{ customer: any }>(`/admin/customers/${id}`),
    setActive: (id: string, isActive: boolean) => patch<any>(`/admin/customers/${id}`, { isActive }),
    adjustWallet: (id: string, amount: number, note?: string) => post<any>(`/admin/customers/${id}/wallet`, { amount, note }),
  },

  refunds: {
    list: (status?: string) => get<{ refunds: any[] }>(`/admin/refunds${status ? `?status=${status}` : ""}`),
    process: (id: string, action: "APPROVE" | "REJECT", note?: string) => patch<any>(`/admin/refunds/${id}`, { action, note }),
  },

  transactions: {
    list: () => get<{ summary: any; transactions: any[] }>("/admin/transactions"),
  },

  settings: {
    get: () => get<{ settings: any }>("/admin/settings"),
    update: (input: Record<string, unknown>) => put<{ settings: any }>("/admin/settings", input),
  },

  staff: {
    list: () => get<{ staff: any[]; stats: any }>("/admin/staff"),
    create: (input: Record<string, unknown>) => post<{ staff: any }>("/admin/staff", input),
    update: (id: string, input: Record<string, unknown>) => patch<{ staff: any }>(`/admin/staff/${id}`, input),
    remove: (id: string) => del<any>(`/admin/staff/${id}`),
  },
};
