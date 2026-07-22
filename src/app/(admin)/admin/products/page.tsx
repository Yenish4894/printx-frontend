"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { admin, ApiError } from "@/lib/api";
import { useConfirm, useToast } from "@/components/ui/UIProvider";

interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  category: string;
  pricingModel: "TIERED" | "PER_UNIT" | "MATRIX";
  isActive: boolean;
  specGroups: number;
  matrixRows: number;
  orderCount: number;
}

const pricingLabel: Record<string, string> = {
  TIERED: "Tiered",
  PER_UNIT: "Per-unit",
  MATRIX: "Matrix",
};

export default function AdminProducts() {
  const confirm = useConfirm();
  const toast = useToast();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch list into state. When `withSpinner` is false the table is NOT blanked
  // (used to refetch after a mutation so the whole table doesn't flash "Loading…").
  async function fetchProducts(withSpinner: boolean) {
    if (withSpinner) setLoading(true);
    setError(null);
    try {
      const res = await admin.products.list();
      setProducts(res.products as AdminProduct[]);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load products");
    } finally {
      if (withSpinner) setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts(true);
  }, []);

  async function handleDelete(id: string, name: string) {
    const ok = await confirm({
      title: `Delete "${name}"?`,
      message: "This cannot be undone.",
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) return;
    setDeletingId(id);
    try {
      await admin.products.remove(id);
      // Optimistically drop the row, then refetch without blanking the table.
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast("Product deleted", "success");
      await fetchProducts(false);
    } catch (e) {
      toast(e instanceof ApiError ? e.message : "Failed to delete product", "error");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">Products</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            {loading ? "Loading catalog…" : `${products.length} Total products in catalog`}
          </p>
        </div>
        <Link href="/admin/products/new" className="primary-accent-gradient text-white flex items-center gap-2 px-6 py-3 rounded-xl font-button text-button shadow-lg shadow-secondary/20 hover:-translate-y-0.5 transition-all active:scale-95">
          <span className="material-symbols-outlined text-[20px]">add</span> New Product
        </Link>
      </div>

      {error && (
        <div className="mb-6 flex flex-wrap items-center gap-2 rounded-xl border border-error/30 bg-error-container/20 px-4 py-3 text-body-md text-error">
          <span className="material-symbols-outlined text-[20px]" aria-hidden="true">error</span> {error}
          <button
            onClick={() => fetchProducts(true)}
            className="ml-auto inline-flex items-center gap-1 px-4 py-2 rounded-lg border border-error/40 font-button text-sm hover:bg-error/10 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">refresh</span> Retry
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl premium-shadow overflow-hidden border border-surface-container-highest">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-surface-container-highest">
                {["Product Info", "Category", "Pricing", "Spec Groups", "Matrix Rows", "Orders", "Status"].map((h, i) => (
                  <th key={i} scope="col" className="py-4 px-6 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">{h}</th>
                ))}
                <th scope="col" className="py-4 px-6 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider text-right">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-highest">
              {loading && (
                <tr><td colSpan={8} className="py-16 text-center text-on-surface-variant font-body-md">Loading products…</td></tr>
              )}
              {!loading && products.length === 0 && !error && (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-on-surface-variant">
                      <span className="material-symbols-outlined text-[48px] opacity-50">inventory_2</span>
                      <p className="font-body-md">No products yet.</p>
                      <Link href="/admin/products/new" className="text-secondary font-button hover:underline">Create your first product</Link>
                    </div>
                  </td>
                </tr>
              )}
              {!loading && products.map((p) => (
                <tr key={p.id} className="hover:bg-surface-container-low transition-colors group">
                  <td className="py-4 px-6">
                    <Link href={`/admin/spec-config?product=${p.id}`} className="flex items-center gap-4 group/link">
                      <div className="w-14 h-14 rounded-lg bg-surface-container-highest flex-shrink-0 flex items-center justify-center border border-outline-variant/20 text-on-surface-variant">
                        <span className="material-symbols-outlined">description</span>
                      </div>
                      <div>
                        <div className="font-body-md font-bold text-primary group-hover/link:text-secondary transition-colors">{p.name}</div>
                        <div className="text-label-caps text-on-surface-variant font-medium">{p.slug}</div>
                      </div>
                    </Link>
                  </td>
                  <td className="py-4 px-6 text-body-md text-on-surface">{p.category}</td>
                  <td className="py-4 px-6"><span className="px-3 py-1 bg-surface-container-highest rounded-full text-label-caps font-bold text-on-surface-variant">{pricingLabel[p.pricingModel] ?? p.pricingModel}</span></td>
                  <td className="py-4 px-6 text-body-md text-on-surface">{p.specGroups}</td>
                  <td className="py-4 px-6 text-body-md text-on-surface">{p.matrixRows}</td>
                  <td className="py-4 px-6 text-body-md text-on-surface">{p.orderCount}</td>
                  <td className="py-4 px-6">
                    {p.isActive
                      ? <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary-container/10 text-secondary-container text-label-caps font-bold"><span className="w-2 h-2 rounded-full bg-secondary-container"></span> Active</span>
                      : <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-surface-container-highest text-on-surface-variant text-label-caps font-bold"><span className="w-2 h-2 rounded-full bg-outline"></span> Inactive</span>}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/admin/spec-config?product=${p.id}`} title="Configure specs" aria-label={`Configure specs for ${p.name}`} className="p-2 hover:bg-surface-container-high rounded-full transition-all text-on-surface-variant hover:text-primary">
                        <span className="material-symbols-outlined text-[20px]" aria-hidden="true">tune</span>
                      </Link>
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        disabled={deletingId === p.id}
                        title="Delete product"
                        aria-label={`Delete ${p.name}`}
                        className="p-2 hover:bg-error-container/20 rounded-full transition-all text-error disabled:opacity-40"
                      >
                        <span className="material-symbols-outlined text-[20px]" aria-hidden="true">{deletingId === p.id ? "hourglass_empty" : "delete"}</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
