"use client";

import { useState } from "react";

const categories = [
  { name: "Business Cards", icon: "business_center", slug: "/business-cards", products: 124, order: 1, active: true },
  { name: "Flyers & Brochures", icon: "description", slug: "/marketing/flyers", products: 86, order: 2, active: true },
  { name: "Posters & Large Format", icon: "photo_size_select_large", slug: "/large-format", products: 42, order: 3, active: true },
  { name: "Custom Packaging", icon: "inventory", slug: "/packaging", products: 19, order: 4, active: false },
];

const iconChoices = ["business_center", "description", "photo_size_select_large", "inventory", "style", "label"];

export default function AdminCategories() {
  const [modalOpen, setModalOpen] = useState(false);

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
        <button onClick={() => setModalOpen(true)} className="primary-accent-gradient text-white px-6 py-3 rounded-xl font-button shadow-lg shadow-secondary-container/20 flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-transform">
          <span className="material-symbols-outlined">add</span><span>Add Category</span>
        </button>
      </div>

      <div className="bg-surface-container-lowest rounded-xl premium-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container/30 border-b border-outline-variant/20">
                <th className="p-6 w-16"></th>
                <th className="py-6 px-4 font-label-caps text-on-surface-variant uppercase">Category</th>
                <th className="py-6 px-4 font-label-caps text-on-surface-variant uppercase">URL Slug</th>
                <th className="py-6 px-4 font-label-caps text-on-surface-variant uppercase text-center">Products</th>
                <th className="py-6 px-4 font-label-caps text-on-surface-variant uppercase text-center">Display Order</th>
                <th className="py-6 px-4 font-label-caps text-on-surface-variant uppercase text-center">Status</th>
                <th className="py-6 px-4 font-label-caps text-on-surface-variant uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {categories.map((c) => (
                <tr key={c.name} className="transition-all hover:bg-surface-container/20 group">
                  <td className="p-6 text-outline cursor-grab"><span className="material-symbols-outlined">drag_indicator</span></td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary"><span className="material-symbols-outlined">{c.icon}</span></div>
                      <span className="font-bold text-on-surface">{c.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 font-mono text-sm text-on-surface-variant">{c.slug}</td>
                  <td className="py-4 px-4 text-center"><span className="bg-primary-fixed/30 text-on-primary-fixed px-3 py-1 rounded-full text-xs font-bold">{c.products}</span></td>
                  <td className="py-4 px-4 text-center"><input className="w-16 h-8 text-center bg-surface-container border-none rounded-lg text-sm focus:ring-1 focus:ring-secondary-container" type="number" defaultValue={c.order} /></td>
                  <td className="py-4 px-4 text-center">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input defaultChecked={c.active} className="sr-only peer" type="checkbox" />
                      <div className="w-11 h-6 bg-outline-variant rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary-container"></div>
                    </label>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 hover:bg-surface-container rounded-lg text-on-surface-variant hover:text-primary transition-colors"><span className="material-symbols-outlined text-[20px]">edit</span></button>
                      <button className="p-2 hover:bg-error-container/20 rounded-lg text-error transition-colors"><span className="material-symbols-outlined text-[20px]">delete</span></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-6 bg-surface-container/10 flex items-center justify-between">
          <p className="text-on-surface-variant text-sm">Showing 1 to 4 of 12 categories</p>
          <div className="flex gap-2">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface-container text-on-surface-variant hover:bg-outline-variant transition-colors"><span className="material-symbols-outlined text-sm">chevron_left</span></button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg primary-accent-gradient text-white font-bold text-sm">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container transition-colors text-sm">2</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container transition-colors text-sm">3</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface-container text-on-surface-variant hover:bg-outline-variant transition-colors"><span className="material-symbols-outlined text-sm">chevron_right</span></button>
          </div>
        </div>
      </div>

      {/* Add Category Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-surface-container-lowest w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-8 py-6 border-b border-outline-variant/10 flex items-center justify-between">
              <div>
                <h3 className="font-headline-md text-headline-md text-primary">Add New Category</h3>
                <p className="text-on-surface-variant text-sm mt-1">Create a new product grouping for your storefront.</p>
              </div>
              <button className="p-2 hover:bg-surface-container rounded-full text-on-surface-variant transition-colors" onClick={() => setModalOpen(false)}><span className="material-symbols-outlined">close</span></button>
            </div>
            <div className="p-8 space-y-6">
              <div>
                <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase mb-2">Category Name</label>
                <input className="w-full px-4 py-3 rounded-xl bg-surface-container border-none focus:ring-2 focus:ring-secondary-container/50 text-on-surface font-medium transition-all" placeholder="e.g., Personalized Stationery" type="text" />
              </div>
              <div>
                <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase mb-3">Select Category Icon</label>
                <div className="grid grid-cols-6 gap-3">
                  {iconChoices.map((ic, i) => (
                    <button key={ic} className={`w-full aspect-square flex items-center justify-center rounded-lg ${i === 0 ? "bg-secondary-container/10 text-secondary-container border-2 border-secondary-container" : "bg-surface-container text-on-surface-variant hover:bg-surface-container-highest transition-colors"}`}>
                      <span className="material-symbols-outlined">{ic}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block font-label-caps text-label-caps text-on-surface-variant uppercase mb-2">Display Order</label>
                <input className="w-full px-4 py-3 rounded-xl bg-surface-container border-none focus:ring-2 focus:ring-secondary-container/50 text-on-surface font-medium" type="number" defaultValue={5} />
              </div>
            </div>
            <div className="px-8 py-6 border-t border-outline-variant/10 flex justify-end gap-3">
              <button onClick={() => setModalOpen(false)} className="px-6 py-3 rounded-xl border border-outline-variant font-button text-on-surface-variant hover:bg-surface-container transition-colors">Cancel</button>
              <button onClick={() => setModalOpen(false)} className="px-6 py-3 rounded-xl primary-accent-gradient text-white font-button shadow-lg shadow-secondary-container/20">Create Category</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
