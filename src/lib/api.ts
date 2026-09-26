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

/**
 * A 401 from any protected endpoint means the session died server-side
 * (deactivated, demoted, expired) since the page loaded. requireUser()
 * re-checks the live DB row on every request, so that could happen at any
 * moment, but nothing was listening for it client-side: the nav, the data
 * on screen and every cached bit of UI stayed exactly as they were until
 * the next manual reload. SessionProvider listens for this event and logs
 * the viewer out the moment it happens instead.
 *
 * /auth/login is exempt: a wrong-password attempt is an expected, inline
 * error for that form, not a sign the session died.
 */
const SESSION_EXEMPT_PATHS = ["/auth/login", "/auth/register", "/auth/logout", "/auth/me"];
export const SESSION_EXPIRED_EVENT = "session-expired";

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
    if (
      res.status === 401 &&
      typeof window !== "undefined" &&
      !SESSION_EXEMPT_PATHS.some((p) => path.startsWith(p))
    ) {
      window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
    }
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
    post<{ pending: true; message: string }>("/auth/register", data),
  logout: () => post("/auth/logout"),
  me: () => get<{ user: SessionUser | null }>("/auth/me"),
};

/** Page metadata every list endpoint returns alongside its rows. */
export interface PageMeta {
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/** Build "?a=1&b=2", skipping undefined/empty values. */
function qs(params: Record<string, string | number | undefined>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

export interface PageOpts {
  page?: number;
  pageSize?: number;
}

// ───────────────────────── Catalog (customer) ─────────────────────────
export const catalog = {
  products: (category?: string, opts: PageOpts = {}) =>
    get<{ products: unknown[] } & PageMeta>(`/products${qs({ category, ...opts })}`),
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

/** One photo on a product, as the admin image manager sees it. */
export interface ProductImage {
  id: string;
  url: string;
  alt: string | null;
  isPrimary: boolean;
  displayOrder: number;
}

// ───────────────────────── Addresses ─────────────────────────
export const addresses = {
  list: () => get<{ addresses: any[] }>("/me/addresses"),
  create: (input: Record<string, unknown>) => post<any>("/me/addresses", input),
  remove: (id: string) => del<{ success: boolean }>(`/me/addresses/${id}`),
};

// ───────────────────────── Orders ─────────────────────────
export const orders = {
  list: (opts: PageOpts & { bucket?: string; q?: string } = {}) =>
    get<
      {
        orders: any[];
        buckets: { all: number; active: number; completed: number; cancelled: number };
        stats: { totalOrders: number; inProgress: number; awaitingPayment: number; paidOrderCount: number; totalSpent: number };
      } & PageMeta
    >(`/orders${qs({ ...opts })}`),
  get: (id: string) => get<{ order: any }>(`/orders/${id}`),
  place: (addressId: string, notes?: string) =>
    post<{ order: any }>("/orders", { addressId, notes }),
  cancel: (id: string, reason?: string) => post<{ order: any }>(`/orders/${id}/cancel`, { reason }),
  uploadItemFile: (id: string, itemId: string, file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return post<any>(`/orders/${id}/items/${itemId}/file`, fd);
  },
  /** Proof of bank transfer: a screenshot or PDF, plus the optional UTR. */
  uploadPaymentProof: (id: string, file: File, reference?: string) => {
    const fd = new FormData();
    fd.append("file", file);
    if (reference) fd.append("reference", reference);
    return post<{ order: any }>(`/orders/${id}/payment`, fd);
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
    images: {
      list: (id: string) => get<{ images: ProductImage[] }>(`/admin/products/${id}/images`),
      addLink: (id: string, url: string, alt?: string) =>
        post<{ image: ProductImage }>(`/admin/products/${id}/images`, { url, alt }),
      upload: (id: string, file: File) => {
        const form = new FormData();
        form.append("file", file);
        return post<{ image: ProductImage }>(`/admin/products/${id}/images`, form);
      },
      makePrimary: (id: string, imageId: string) =>
        patch<{ images: ProductImage[] }>(`/admin/products/${id}/images/${imageId}`, { primary: true }),
      remove: (id: string, imageId: string) => del<{ id: string }>(`/admin/products/${id}/images/${imageId}`),
    },
    addSpecGroup: (id: string, input: Record<string, unknown>) => post<any>(`/admin/products/${id}/spec-groups`, input),
    setTiers: (id: string, tiers: unknown[]) => put<any>(`/admin/products/${id}/tiers`, { tiers }),
    setDelivery: (id: string, speeds: unknown[]) => put<any>(`/admin/products/${id}/delivery`, { speeds }),
    getMatrix: (id: string) => get<{ matrix: any }>(`/admin/products/${id}/matrix`),
    setMatrix: (id: string, rows: unknown[]) => put<any>(`/admin/products/${id}/matrix`, { rows }),
  },

  rules: {
    list: (productId: string) => get<{ rules: any[] }>(`/admin/products/${productId}/rules`),
    create: (productId: string, input: Record<string, unknown>) =>
      post<{ rule: any }>(`/admin/products/${productId}/rules`, input),
    update: (id: string, input: Record<string, unknown>) => patch<{ rule: any }>(`/admin/rules/${id}`, input),
    remove: (id: string) => del<any>(`/admin/rules/${id}`),
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
    list: (status?: string, opts: PageOpts & { q?: string } = {}) => get<{ orders: any[] } & PageMeta>(`/admin/orders${qs({ status, ...opts })}`),
    get: (id: string) => get<{ order: any }>(`/admin/orders/${id}`),
    setStatus: (id: string, status: string, note?: string) => patch<any>(`/admin/orders/${id}/status`, { status, note }),
    reviewPayment: (id: string, action: "APPROVE" | "REJECT", proofUrl: string, reason?: string) =>
      post<{ result: { status: string; payment: string } }>(`/admin/orders/${id}/payment`, { action, reason, proofUrl }),
    reviewFile: (id: string, itemId: string, action: "APPROVE" | "REJECT", reason?: string) =>
      patch<any>(`/admin/orders/${id}/items/${itemId}/review`, { action, reason }),
  },

  customers: {
    list: (opts: PageOpts & { q?: string; active?: string; approval?: string } = {}) => get<{ customers: any[]; pendingApproval: number } & PageMeta>(`/admin/customers${qs({ ...opts })}`),
    get: (id: string) => get<{ customer: any }>(`/admin/customers/${id}`),
    setActive: (id: string, isActive: boolean) => patch<any>(`/admin/customers/${id}`, { isActive }),
    review: (id: string, action: "APPROVE" | "REJECT", reason?: string) =>
      post<{ result: { id: string; approvalStatus: "APPROVED" | "REJECTED"; isActive: boolean } }>(`/admin/customers/${id}/approval`, { action, reason }),
  },

  refunds: {
    list: (status?: string, opts: PageOpts = {}) => get<{ refunds: any[]; counts: Record<string, number> } & PageMeta>(`/admin/refunds${qs({ status, ...opts })}`),
    process: (id: string, action: "APPROVE" | "REJECT", note?: string) => patch<any>(`/admin/refunds/${id}`, { action, note }),
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
