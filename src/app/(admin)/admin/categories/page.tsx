"use client";

import { useEffect, useRef, useState } from "react";
import { admin, ApiError } from "@/lib/api";
import { useConfirm, useToast } from "@/components/ui/UIProvider";
import Switch from "@/components/ui/Switch";

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  displayOrder: number;
  isActive: boolean;
  productCount: number;
}

const iconChoices = ["business_center", "description", "photo_size_select_large", "inventory", "style", "label"];

export default function AdminCategories() {
  const confirm = useConfirm();
  const toast = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  // create modal
  const [modalOpen, setModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState(iconChoices[0]);
  const [newOrder, setNewOrder] = useState("0");
  const [creating, setCreating] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // inline edit
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editIcon, setEditIcon] = useState("");
  const [editOrder, setEditOrder] = useState("0");
  const [editActive, setEditActive] = useState(true);

  // Fetch list into state. When `withSpinner` is false the table is NOT blanked
  // (used to refetch after a mutation so the whole table doesn't flash "Loading…").
  async function fetchCategories(withSpinner: boolean) {
    if (withSpinner) setLoading(true);
    setError(null);
    try {
      const res = await admin.categories.list();
      setCategories(res.categories as Category[]);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load categories");
    } finally {
      if (withSpinner) setLoading(false);
    }
  }

  useEffect(() => {
    fetchCategories(true);
  }, []);

  // Autofocus the name field + Escape to close when the modal opens.
  useEffect(() => {
    if (!modalOpen) return;
    nameInputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalOpen]);

  const modalDirty = () =>
    newName.trim() !== "" || newIcon !== iconChoices[0] || newOrder !== "0";

  async function closeModal() {
    if (creating) return; // don't dismiss mid-save
    if (modalDirty()) {
      const ok = await confirm({
        title: "Discard new category?",
        message: "Your unsaved changes will be lost.",
        confirmLabel: "Discard",
        cancelLabel: "Keep editing",
        danger: true,
      });
      if (!ok) return;
    }
    setModalOpen(false);
    setNewName("");
    setNewIcon(iconChoices[0]);
    setNewOrder("0");
    setModalError(null);
  }

  async function handleCreate() {
    if (!newName.trim()) {
      setModalError("Category name is required");
      return;
    }
    setCreating(true);
    setModalError(null);
    try {
      await admin.categories.create({
        name: newName.trim(),
        icon: newIcon,
        displayOrder: Number(newOrder) || 0,
      });
      setModalOpen(false);
      setNewName("");
      setNewIcon(iconChoices[0]);
      setNewOrder("0");
      toast("Category created", "success");
      await fetchCategories(false);
    } catch (e) {
      setModalError(e instanceof ApiError ? e.message : "Failed to create category");
    } finally {
      setCreating(false);
    }
  }

  function startEdit(c: Category) {
    setEditId(c.id);
    setEditName(c.name);
    setEditIcon(c.icon ?? iconChoices[0]);
    setEditOrder(String(c.displayOrder));
    setEditActive(c.isActive);
    setError(null);
  }

  async function saveEdit(id: string) {
    if (!editName.trim()) {
      setError("Category name is required");
      return;
    }
    setBusyId(id);
    setError(null);
    try {
      await admin.categories.update(id, {
        name: editName.trim(),
        icon: editIcon,
        displayOrder: Number(editOrder) || 0,
        isActive: editActive,
      });
      setEditId(null);
      toast("Category updated", "success");
      await fetchCategories(false);
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Failed to update category";
      setError(msg);
      toast(msg, "error");
    } finally {
      setBusyId(null);
    }
  }

  async function toggleActive(c: Category) {
    setBusyId(c.id);
    setError(null);
    try {
      // Send the FULL current fields so the backend can't wipe icon/displayOrder.
      await admin.categories.update(c.id, {
        name: c.name,
        icon: c.icon,
        displayOrder: c.displayOrder,
        isActive: !c.isActive,
      });
      toast(!c.isActive ? "Category activated" : "Category deactivated", "success");
      await fetchCategories(false);
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Failed to update category";
      setError(msg);
      toast(msg, "error");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(c: Category) {
    const ok = await confirm({
      title: `Delete "${c.name}"?`,
      message: c.productCount > 0
        ? `This category has ${c.productCount} product${c.productCount === 1 ? "" : "s"}. This cannot be undone.`
        : "This cannot be undone.",
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) return;
    setBusyId(c.id);
    setError(null);
    try {
      await admin.categories.remove(c.id);
      setCategories((prev) => prev.filter((x) => x.id !== c.id));
      toast("Category deleted", "success");
      await fetchCategories(false);
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Failed to delete category";
      setError(msg);
      toast(msg, "error");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <div className="flex items-end justify-between mb-8">
        <div>
          <nav className="flex items-center gap-2 text-on-surface-variant font-label-caps mb-2">
            <span>Catalog</span>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-secondary font-bold">Categories</span>
          </nav>
          <h2 className="font-headline-lg text-headline-lg text-primary">Categories</h2>
        </div>
        <button onClick={() => { setModalOpen(true); setModalError(null); }} className="primary-accent-gradient text-white px-6 py-3 rounded-xl font-button shadow-lg shadow-secondary-container/20 flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-transform">
          <span className="material-symbols-outlined">add</span><span>Add Category</span>
        </button>
      </div>

      {error && (
        <div className="mb-6 flex flex-wrap items-center gap-2 rounded-xl border border-error/30 bg-error-container/20 px-4 py-3 text-body-md text-error" role="alert">
          <span className="material-symbols-outlined text-[20px]" aria-hidden="true">error</span> {error}
          <button
            onClick={() => fetchCategories(true)}
            className="ml-auto inline-flex items-center gap-1 px-4 py-2 rounded-lg border border-error/40 font-button text-sm hover:bg-error/10 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">refresh</span> Retry
          </button>
        </div>
      )}

      <div className="bg-surface-container-lowest rounded-xl premium-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container/30 border-b border-outline-variant/20">
                <th scope="col" className="py-6 px-4 font-label-caps text-on-surface-variant uppercase">Category</th>
                <th scope="col" className="py-6 px-4 font-label-caps text-on-surface-variant uppercase">URL Slug</th>
                <th scope="col" className="py-6 px-4 font-label-caps text-on-surface-variant uppercase text-center">Products</th>
                <th scope="col" className="py-6 px-4 font-label-caps text-on-surface-variant uppercase text-center">Display Order</th>
                <th scope="col" className="py-6 px-4 font-label-caps text-on-surface-variant uppercase text-center">Status</th>
                <th scope="col" className="py-6 px-4 font-label-caps text-on-surface-variant uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {loading && (
                <tr><td colSpan={6} className="py-16 text-center text-on-surface-variant">Loading categories…</td></tr>
              )}
              {!loading && categories.length === 0 && !error && (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-on-surface-variant">
                      <span className="material-symbols-outlined text-[48px] opacity-50">category</span>
                      <p>No categories yet.</p>
                    </div>
                  </td>
                </tr>
              )}
              {!loading && categories.map((c) => {
                const editing = editId === c.id;
                return (
                  <tr key={c.id} className="transition-all hover:bg-surface-container/20 group">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        {editing ? (
                          <>
                            <select value={editIcon} onChange={(e) => setEditIcon(e.target.value)} className="w-12 h-10 bg-surface-container border-none rounded-lg text-center">
                              {iconChoices.map((ic) => <option key={ic} value={ic}>{ic}</option>)}
                            </select>
                            <input value={editName} onChange={(e) => setEditName(e.target.value)} className="bg-surface-container border-none rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-secondary-container" />
                          </>
                        ) : (
                          <>
                            <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary"><span className="material-symbols-outlined">{c.icon ?? "label"}</span></div>
                            <span className="font-bold text-on-surface">{c.name}</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 font-mono text-sm text-on-surface-variant">/{c.slug}</td>
                    <td className="py-4 px-4 text-center"><span className="bg-primary-fixed/30 text-on-primary-fixed px-3 py-1 rounded-full text-xs font-bold">{c.productCount}</span></td>
                    <td className="py-4 px-4 text-center">
                      {editing ? (
                        <input type="number" value={editOrder} onChange={(e) => setEditOrder(e.target.value)} className="w-16 h-8 text-center bg-surface-container border-none rounded-lg text-sm focus:ring-1 focus:ring-secondary-container" />
                      ) : (
                        <span className="text-sm text-on-surface-variant">{c.displayOrder}</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex justify-center">
                        <Switch
                          checked={editing ? editActive : c.isActive}
                          onChange={() => editing ? setEditActive((v) => !v) : toggleActive(c)}
                          disabled={busyId === c.id}
                          label={`${(editing ? editActive : c.isActive) ? "Deactivate" : "Activate"} ${c.name}`}
                        />
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {editing ? (
                          <>
                            <button onClick={() => saveEdit(c.id)} disabled={busyId === c.id} aria-label={`Save ${c.name}`} className="p-2 hover:bg-secondary-container/20 rounded-lg text-secondary-container transition-colors disabled:opacity-40"><span className="material-symbols-outlined text-[20px]" aria-hidden="true">check</span></button>
                            <button onClick={() => setEditId(null)} aria-label="Cancel editing" className="p-2 hover:bg-surface-container rounded-lg text-on-surface-variant transition-colors"><span className="material-symbols-outlined text-[20px]" aria-hidden="true">close</span></button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => startEdit(c)} aria-label={`Edit ${c.name}`} className="p-2 hover:bg-surface-container rounded-lg text-on-surface-variant hover:text-primary transition-colors"><span className="material-symbols-outlined text-[20px]" aria-hidden="true">edit</span></button>
                            <button onClick={() => handleDelete(c)} disabled={busyId === c.id} aria-label={`Delete ${c.name}`} className="p-2 hover:bg-error-container/20 rounded-lg text-error transition-colors disabled:opacity-40"><span className="material-symbols-outlined text-[20px]" aria-hidden="true">delete</span></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Category Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={closeModal}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="category-modal-title"
            className="bg-surface-container-lowest w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-8 py-6 border-b border-outline-variant/10 flex items-center justify-between">
              <div>
                <h3 id="category-modal-title" className="font-headline-md text-headline-md text-primary">Add New Category</h3>
                <p className="text-on-surface-variant text-sm mt-1">Create a new product grouping for your storefront.</p>
              </div>
              <button aria-label="Close" className="p-2 hover:bg-surface-container rounded-full text-on-surface-variant transition-colors" onClick={closeModal}><span className="material-symbols-outlined" aria-hidden="true">close</span></button>
            </div>
            <div className="p-8 space-y-6">
              {modalError && (
                <div className="flex items-center gap-2 rounded-lg border border-error/30 bg-error-container/20 px-3 py-2 text-sm text-error" role="alert">
                  <span className="material-symbols-outlined text-[18px]" aria-hidden="true">error</span> {modalError}
                </div>
              )}
              <div>
                <label htmlFor="new-category-name" className="block font-label-caps text-label-caps text-on-surface-variant uppercase mb-2">Category Name</label>
                <input ref={nameInputRef} id="new-category-name" value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-surface-container border-none focus:ring-2 focus:ring-secondary-container/50 text-on-surface font-medium transition-all" placeholder="e.g., Personalized Stationery" type="text" />
              </div>
              <div>
                <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase mb-3">Select Category Icon</label>
                <div className="grid grid-cols-6 gap-3">
                  {iconChoices.map((ic) => (
                    <button key={ic} type="button" onClick={() => setNewIcon(ic)} aria-label={`Icon ${ic}`} aria-pressed={ic === newIcon} className={`w-full aspect-square flex items-center justify-center rounded-lg ${ic === newIcon ? "bg-secondary-container/10 text-secondary-container border-2 border-secondary-container" : "bg-surface-container text-on-surface-variant hover:bg-surface-container-highest transition-colors"}`}>
                      <span className="material-symbols-outlined" aria-hidden="true">{ic}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="new-category-order" className="block font-label-caps text-label-caps text-on-surface-variant uppercase mb-2">Display Order</label>
                <input id="new-category-order" value={newOrder} onChange={(e) => setNewOrder(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-surface-container border-none focus:ring-2 focus:ring-secondary-container/50 text-on-surface font-medium" type="number" min={0} />
              </div>
            </div>
            <div className="px-8 py-6 border-t border-outline-variant/10 flex justify-end gap-3">
              <button onClick={closeModal} disabled={creating} className="px-6 py-3 rounded-xl border border-outline-variant font-button text-on-surface-variant hover:bg-surface-container transition-colors disabled:opacity-60">Cancel</button>
              <button onClick={handleCreate} disabled={creating} className="px-6 py-3 rounded-xl primary-accent-gradient text-white font-button shadow-lg shadow-secondary-container/20 disabled:opacity-60">{creating ? "Creating…" : "Create Category"}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
