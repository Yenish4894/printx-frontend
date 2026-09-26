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
type Money = number;
export interface SessionUser {
  id: string;
  businessName: string;
  ownerName: string;
  mobile: string;
  email: string;
  gstNumber?: string | null;
  role: "CUSTOMER" | "ADMIN" | "SUPER_ADMIN";
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

/** Pricing model of a product. */
export type PricingModel = "PER_UNIT" | "MATRIX";

/** A saved delivery address (raw row from /me/addresses). */
export interface Address {
  id: string;
  userId: string;
  label: string;
  name: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  isDefault: boolean;
  createdAt: string;
}

/** One line of the customer's cart. specSnapshot is what the server priced (opaque here). */
export interface CartItem {
  id: string;
  productName: string;
  productSlug: string;
  image: string | null;
  quantity: number;
  minQuantity: number;
  quantityStep: number;
  maxQuantity: number | null;
  specSnapshot: unknown;
  deliverySpeed: string | null;
  deliveryFee: number;
  unitPrice: number;
  lineSubtotal: number;
  gstAmount: number;
  lineTotal: number;
  fileStatus: string | null;
  fileName: string | null;
  notes: string | null;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  deliveryCharge: number;
  gst: number;
  total: number;
  count: number;
}

export interface BankDetails {
  accountName: string | null;
  bankName: string | null;
  accountNumber: string | null;
  ifsc: string | null;
}

/** The order's payment, as the customer sees it. */
export interface OrderPayment {
  method: string;
  status: string;
  amount: number;
  proofUrl: string | null;
  proofName: string | null;
  proofUploadedAt: string | null;
  reference: string | null;
  rejectReason: string | null;
  reviewedAt: string | null;
}

export interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  specSnapshot: unknown;
  unitPrice: number;
  lineSubtotal: number;
  deliveryEtaLabel: string | null;
  fileStatus: string | null;
  fileName: string | null;
  fileRejectReason: string | null;
}

export interface OrderStatusEntry {
  status: string;
  note: string | null;
  at: string;
}

/** The address the order was placed with (a JSON snapshot, so every field is optional). */
export interface ShippingSnapshot {
  label?: string;
  name?: string;
  line1?: string;
  line2?: string | null;
  city?: string;
  state?: string;
  pincode?: string;
  phone?: string;
}

/** GET /orders/:id (also what the item-file and payment-proof uploads return). */
export interface OrderDetail {
  id: string;
  orderNumber: string;
  invoiceNumber: string | null;
  status: string;
  subtotal: number;
  deliveryCharge: number;
  gstAmount: number;
  totalAmount: number;
  shipping: ShippingSnapshot | null;
  notes: string | null;
  placedAt: string;
  items: OrderItem[];
  statusHistory: OrderStatusEntry[];
  payment: OrderPayment | null;
  bankDetails: BankDetails | null;
  refunds: { amount: number; status: string; reason: string | null; processedAt: string | null }[];
}

/** One row of the customer's order list. */
export interface OrderSummary {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  itemCount: number;
  items: string[];
  placedAt: string;
}

/** A product card in the catalogue listing. */
export interface ProductCard {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: { slug: string; name: string; parent: { slug: string; name: string } | null };
  badges: string[];
  priceFrom: number | null;
  image: string | null;
}

export interface CatalogOption {
  id: string;
  name: string;
  description: string | null;
  addOnType: "FLAT" | "PER_UNIT";
  addOnValue: number;
  perQuantity: number;
  isDefault: boolean;
  quantityValue: number | null;
  code: string | null;
}

export interface CatalogSpecGroup {
  id: string;
  name: string;
  selectionType: "SINGLE_SELECT" | "MULTI_SELECT";
  isRequired: boolean;
  isPricingDimension: boolean;
  isQuantityDimension: boolean;
  icon: string | null;
  options: CatalogOption[];
}

export interface DeliverySpeed {
  id: string;
  name: string;
  fee: number;
  etaMinDays: number;
  etaMaxDays: number;
}

export interface VisibilityRuleData {
  id: string;
  targetType: "GROUP" | "OPTION";
  targetGroupId: string | null;
  targetOptionId: string | null;
  logic: "AND" | "OR";
  conditions: { sourceGroupId: string; operator: "IS" | "IS_NOT" | "IN"; optionIds: string[] }[];
}

/** GET /products/:slug, everything the configurator needs. */
export interface CatalogProduct {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: { slug: string; name: string };
  pricingModel: PricingModel;
  unitType: string | null;
  requiresDimensions: boolean;
  unitRate: number | null;
  minQuantity: number;
  maxQuantity: number | null;
  quantityStep: number;
  productCode: string | null;
  productClass: string | null;
  productionTime: string | null;
  pricesIncludeGst: boolean;
  singlePrintThreshold: number | null;
  singlePrintRate: number | null;
  badges: string[];
  printTypeLabel: string | null;
  standardSizeLabel: string | null;
  bleedArea: string | null;
  fileFormats: string[];
  images: { url: string; alt: string | null }[];
  specGroups: CatalogSpecGroup[];
  deliverySpeeds: DeliverySpeed[];
  visibilityRules: VisibilityRuleData[];
}

// ───────────────────────── Auth ─────────────────────────
export const auth = {
  login: (mobile: string, password: string) =>
    post<{ user: SessionUser }>("/auth/login", { mobile, password }),
  register: (data: Record<string, unknown>) =>
    post<{ pending: true; message: string }>("/auth/register", data),
  logout: () => post("/auth/logout"),
  changePassword: (currentPassword: string, newPassword: string) =>
    post<{ success: true }>("/auth/change-password", { currentPassword, newPassword }),
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
    get<{ products: ProductCard[] } & PageMeta>(`/products${qs({ category, ...opts })}`),
  product: (slug: string) => get<{ product: CatalogProduct }>(`/products/${slug}`),
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
  get: () => get<Cart>("/cart"),
  add: (input: Record<string, unknown>) => post<Cart>("/cart/items", input),
  updateQty: (id: string, quantity: number) => patch<Cart>(`/cart/items/${id}`, { quantity }),
  remove: (id: string) => del<Cart>(`/cart/items/${id}`),
  uploadFile: (id: string, file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return post<Cart>(`/cart/items/${id}/file`, fd);
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
  list: () => get<{ addresses: Address[] }>("/me/addresses"),
  create: (input: Record<string, unknown>) => post<{ address: Address }>("/me/addresses", input),
  remove: (id: string) => del<{ success: boolean }>(`/me/addresses/${id}`),
};

// ───────────────────────── Orders ─────────────────────────
export const orders = {
  list: (opts: PageOpts & { bucket?: string; q?: string } = {}) =>
    get<
      {
        orders: OrderSummary[];
        buckets: { all: number; active: number; completed: number; cancelled: number };
        stats: { totalOrders: number; inProgress: number; awaitingPayment: number; paidOrderCount: number; totalSpent: number };
      } & PageMeta
    >(`/orders${qs({ ...opts })}`),
  get: (id: string) => get<{ order: OrderDetail }>(`/orders/${id}`),
  place: (addressId: string, notes?: string) =>
    post<{ order: { id: string; orderNumber: string; totalAmount: number; status: "PAYMENT_PENDING" } }>("/orders", {
      addressId,
      notes,
    }),
  cancel: (id: string, reason?: string) => post<{ order: { id: string; status: "CANCELLED"; refundAmount: number; refundPending: boolean } }>(
      `/orders/${id}/cancel`,
      { reason },
    ),
  uploadItemFile: (id: string, itemId: string, file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return post<{ order: OrderDetail }>(`/orders/${id}/items/${itemId}/file`, fd);
  },
  /** Proof of bank transfer: a screenshot or PDF, plus the optional UTR. */
  uploadPaymentProof: (id: string, file: File, reference?: string) => {
    const fd = new FormData();
    fd.append("file", file);
    if (reference) fd.append("reference", reference);
    return post<{ order: OrderDetail }>(`/orders/${id}/payment`, fd);
  },
};

// ───────────────────────── Notifications ─────────────────────────
export interface NotificationItem {
  id: string;
  type: "ORDER" | "SYSTEM";
  title: string;
  body: string | null;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

export const notifications = {
  list: (opts: PageOpts = {}) =>
    get<{ notifications: NotificationItem[]; unread: number } & PageMeta>(`/notifications${qs({ ...opts })}`),
  /** Mark one read, or every unread one when no id is given. */
  markRead: (id?: string) => post<{ updated: number }>("/notifications/read", id ? { id } : {}),
};

// ───────────────────────── Admin types ─────────────────────────
export interface AdminStats {
  totalOrders: number;
  activeOrders: number;
  customers: number;
  products: number;
  revenue: number;
  pendingRefunds: number;
  awaitingPayment: number;
  paymentsToVerify: number;
  pendingSignups: number;
  ordersByStatus: Record<string, number>;
  recentOrders: {
    id: string;
    orderNumber: string;
    customer: string;
    status: string;
    totalAmount: number;
    placedAt: string;
  }[];
}

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  displayOrder: number;
  isActive: boolean;
  productCount: number;
  parentId: string | null;
  parentName: string | null;
  childCount: number;
}

/** One row of the admin product list. */
export interface AdminProductRow {
  id: string;
  name: string;
  slug: string;
  category: string;
  pricingModel: PricingModel;
  isActive: boolean;
  specGroups: number;
  matrixRows: number;
  orderCount: number;
  image: string | null;
  imageCount: number;
}

export interface AdminSpecOption {
  id: string;
  name: string;
  description: string | null;
  addOnType: "FLAT" | "PER_UNIT";
  addOnValue: number;
  perQuantity: number;
  isDefault: boolean;
  displayOrder: number;
  isActive: boolean;
  quantityValue: number | null;
  code: string | null;
}

export interface AdminSpecGroup {
  id: string;
  name: string;
  selectionType: "SINGLE_SELECT" | "MULTI_SELECT";
  isPricingDimension: boolean;
  isQuantityDimension: boolean;
  isRequired: boolean;
  icon: string | null;
  displayOrder: number;
  isActive: boolean;
  options: AdminSpecOption[];
}

/** GET /admin/products/:id */
export interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  categoryId: string;
  category: string;
  pricingModel: PricingModel;
  unitType: string | null;
  requiresDimensions: boolean;
  unitRate: number | null;
  minQuantity: number;
  maxQuantity: number | null;
  quantityStep: number;
  additionalDesignCharge: number | null;
  productCode: string | null;
  productClass: string | null;
  productionTime: string | null;
  pricesIncludeGst: boolean;
  singlePrintThreshold: number | null;
  singlePrintRate: number | null;
  badges: string[];
  printTypeLabel: string | null;
  standardSizeLabel: string | null;
  bleedArea: string | null;
  fileFormats: string[];
  basePriceFrom: number | null;
  isActive: boolean;
  specGroups: AdminSpecGroup[];
  deliverySpeeds: DeliverySpeed[];
  matrixRows: number;
}

/** GET /admin/products/:id/matrix */
export interface PriceMatrix {
  productId: string;
  pricingModel: PricingModel;
  pricesIncludeGst: boolean;
  dimensions: {
    id: string;
    name: string;
    isQuantityDimension: boolean;
    options: { id: string; name: string }[];
  }[];
  rows: {
    id: string;
    optionIds: string[];
    labels: string[];
    ratePerSheet: number | null;
    flatPrice: number | null;
    isActive: boolean;
  }[];
}

export interface VisibilityRule {
  id: string;
  targetType: "GROUP" | "OPTION";
  targetGroupId: string | null;
  targetOptionId: string | null;
  targetLabel: string;
  logic: "AND" | "OR";
  conditions: {
    id: string;
    sourceGroupId: string;
    sourceGroupName: string;
    operator: "IS" | "IS_NOT" | "IN";
    optionIds: string[];
    optionNames: string[];
  }[];
}

/** The payment on an admin order: the customer's view plus other orders quoting the same UTR. */
export interface AdminOrderPayment extends OrderPayment {
  referenceUsedOn: string[];
}

export interface AdminOrderRow {
  id: string;
  orderNumber: string;
  status: string;
  payment: { status: string; hasProof: boolean } | null;
  customer: string;
  customerMobile: string;
  totalAmount: number;
  itemCount: number;
  placedAt: string;
}

/** GET /admin/orders/:id */
export interface AdminOrder {
  id: string;
  orderNumber: string;
  invoiceNumber: string | null;
  status: string;
  customer: { id: string; businessName: string; ownerName: string; mobile: string; email: string };
  subtotal: number;
  deliveryCharge: number;
  gstAmount: number;
  totalAmount: number;
  shipping: ShippingSnapshot | null;
  notes: string | null;
  placedAt: string;
  items: (OrderItem & { gstAmount: number; fileUrl: string | null })[];
  statusHistory: OrderStatusEntry[];
  refunds: { id: string; amount: number; status: string; reason: string | null }[];
  payment: AdminOrderPayment | null;
}

export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface AdminCustomerRow {
  id: string;
  businessName: string;
  ownerName: string;
  mobile: string;
  email: string;
  gstNumber: string | null;
  isActive: boolean;
  approvalStatus: ApprovalStatus;
  orderCount: number;
  joinedAt: string;
}

/** GET /admin/customers/:id */
export interface AdminCustomer {
  id: string;
  businessName: string;
  ownerName: string;
  mobile: string;
  email: string;
  gstNumber: string | null;
  isActive: boolean;
  approvalStatus: ApprovalStatus;
  approvalRejectReason: string | null;
  approvalReviewedAt: string | null;
  joinedAt: string;
  totalSpent: number;
  orderCount: number;
  addresses: Omit<Address, "userId" | "createdAt">[];
  orders: { id: string; orderNumber: string; status: string; totalAmount: number; placedAt: string }[];
}

export interface AdminRefund {
  id: string;
  orderNumber: string;
  customer: string;
  customerMobile: string;
  amount: number;
  status: string;
  reason: string | null;
  createdAt: string;
  processedAt: string | null;
}

/** GET /admin/settings. Bank details are nested here; the settings form flattens them. */
export interface PlatformSettings {
  gstPercent: number;
  gstRate: number;
  freeShippingThreshold: number;
  autoRoundPrices: boolean;
  cancellationWindowHours: number;
  fileGracePeriod: boolean;
  defaultDpi: string;
  defaultColorProfile: string;
  standardBleedMm: number;
  businessGstNumber: string | null;
  supportPhone: string | null;
  supportEmail: string | null;
  socialFacebook: string | null;
  socialInstagram: string | null;
  socialTwitter: string | null;
  socialLinkedin: string | null;
  bank: BankDetails;
}

export interface StaffMember {
  id: string;
  name: string;
  businessName: string;
  mobile: string;
  email: string;
  role: "ADMIN" | "SUPER_ADMIN";
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

// ───────────────────────── Admin ─────────────────────────
export const admin = {
  stats: () => get<{ stats: AdminStats }>("/admin/stats"),

  categories: {
    list: () => get<{ categories: AdminCategory[] }>("/admin/categories"),
    create: (input: Record<string, unknown>) => post<{ category: { id: string } }>("/admin/categories", input),
    update: (id: string, input: Record<string, unknown>) => patch<{ category: { id: string } }>(`/admin/categories/${id}`, input),
    remove: (id: string) => del<{ id: string }>(`/admin/categories/${id}`),
  },

  products: {
    list: () => get<{ products: AdminProductRow[] }>("/admin/products"),
    get: (id: string) => get<{ product: AdminProduct }>(`/admin/products/${id}`),
    create: (input: Record<string, unknown>) => post<{ product: { id: string; slug: string } }>("/admin/products", input),
    update: (id: string, input: Record<string, unknown>) => patch<{ product: { id: string } }>(`/admin/products/${id}`, input),
    remove: (id: string) => del<{ id: string; softDeleted: boolean }>(`/admin/products/${id}`),
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
    addSpecGroup: (id: string, input: Record<string, unknown>) => post<{ specGroup: { id: string } }>(`/admin/products/${id}/spec-groups`, input),
    getMatrix: (id: string) => get<{ matrix: PriceMatrix }>(`/admin/products/${id}/matrix`),
    setMatrix: (id: string, rows: unknown[]) => put<{ count: number }>(`/admin/products/${id}/matrix`, { rows }),
  },

  rules: {
    list: (productId: string) => get<{ rules: VisibilityRule[] }>(`/admin/products/${productId}/rules`),
    create: (productId: string, input: Record<string, unknown>) =>
      post<{ rule: VisibilityRule }>(`/admin/products/${productId}/rules`, input),
    update: (id: string, input: Record<string, unknown>) => patch<{ rule: VisibilityRule }>(`/admin/rules/${id}`, input),
    remove: (id: string) => del<{ id: string }>(`/admin/rules/${id}`),
  },

  specGroups: {
    update: (id: string, input: Record<string, unknown>) => patch<{ specGroup: { id: string } }>(`/admin/spec-groups/${id}`, input),
    remove: (id: string) => del<{ id: string }>(`/admin/spec-groups/${id}`),
    addOption: (id: string, input: Record<string, unknown>) => post<{ option: { id: string } }>(`/admin/spec-groups/${id}/options`, input),
  },
  specOptions: {
    update: (id: string, input: Record<string, unknown>) => patch<{ option: { id: string } }>(`/admin/spec-options/${id}`, input),
    remove: (id: string) => del<{ id: string }>(`/admin/spec-options/${id}`),
  },

  orders: {
    list: (status?: string, opts: PageOpts & { q?: string } = {}) => get<{ orders: AdminOrderRow[] } & PageMeta>(`/admin/orders${qs({ status, ...opts })}`),
    get: (id: string) => get<{ order: AdminOrder }>(`/admin/orders/${id}`),
    setStatus: (id: string, status: string, note?: string) => patch<{ order: { id: string; status: string; refundAmount: number } }>(`/admin/orders/${id}/status`, {
        status,
        note,
      }),
    reviewPayment: (id: string, action: "APPROVE" | "REJECT", proofUrl: string, reason?: string) =>
      post<{ result: { id: string; status: string; payment: string } }>(`/admin/orders/${id}/payment`, { action, reason, proofUrl }),
    reviewFile: (id: string, itemId: string, action: "APPROVE" | "REJECT", reason?: string) =>
      patch<{ item: { id: string; fileStatus: string } }>(`/admin/orders/${id}/items/${itemId}/review`, { action, reason }),
  },

  customers: {
    list: (opts: PageOpts & { q?: string; active?: string; approval?: string } = {}) => get<{ customers: AdminCustomerRow[]; pendingApproval: number } & PageMeta>(`/admin/customers${qs({ ...opts })}`),
    get: (id: string) => get<{ customer: AdminCustomer }>(`/admin/customers/${id}`),
    setActive: (id: string, isActive: boolean) => patch<{ customer: { id: string; isActive: boolean } }>(`/admin/customers/${id}`, { isActive }),
    review: (id: string, action: "APPROVE" | "REJECT", reason?: string) =>
      post<{ result: { id: string; approvalStatus: "APPROVED" | "REJECTED"; isActive: boolean } }>(`/admin/customers/${id}/approval`, { action, reason }),
  },

  refunds: {
    list: (status?: string, opts: PageOpts = {}) => get<{ refunds: AdminRefund[]; counts: Record<string, number> } & PageMeta>(`/admin/refunds${qs({ status, ...opts })}`),
    process: (id: string, action: "APPROVE" | "REJECT", note?: string) => patch<{ refund: { id: string; status: string; amount?: number } }>(`/admin/refunds/${id}`, { action, note }),
  },

  settings: {
    get: () => get<{ settings: PlatformSettings }>("/admin/settings"),
    update: (input: Record<string, unknown>) => put<{ settings: PlatformSettings }>("/admin/settings", input),
  },

  staff: {
    list: () => get<{ staff: StaffMember[]; stats: { total: number; superAdmins: number; active: number } }>("/admin/staff"),
    create: (input: Record<string, unknown>) => post<{ staff: StaffMember }>("/admin/staff", input),
    update: (id: string, input: Record<string, unknown>) => patch<{ staff: StaffMember }>(`/admin/staff/${id}`, input),
    remove: (id: string) => del<{ id: string; deactivated: boolean }>(`/admin/staff/${id}`),
  },
};
