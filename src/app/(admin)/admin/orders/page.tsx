import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Bhagini Graphics Admin | Orders" };

const statusFilters: [string, string, boolean][] = [
  ["All", "1,248", true],
  ["Placed", "14", false],
  ["Payment Confirmed", "42", false],
  ["Design Review", "12", false],
  ["Printing", "124", false],
  ["Quality Check", "31", false],
  ["Out for Delivery", "8", false],
  ["Delivered", "985", false],
  ["Cancelled", "32", false],
];

type Row = {
  id: string; name: string; phone: string; initials?: string; img?: string;
  items: number; amount: string; payment: string; date: string;
  status: string; statusColor: string; dotColor: string; filesOk: boolean;
};

const rows: Row[] = [
  { id: "#PX-2023-8901", name: "Meera Kapoor", phone: "+91 98765 43210", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBR7VbNSkF3x2nf47pr826809DnmatNFZN9kt0PM-x30aGkY6MT6jVYEAKAMRmo8deRJx1xLovJiNvq3fp-WtanXJiq62tIBc9B2A7Ma21cEKVmFWRsnYXHMqgJkUW1XPBb_EKddX3l1cADROekMfdc_6sNUnpTYcQLgguXuBedqFg1xlLzyJvar7L6OfwMPnlTfVIay8kAVqbRhcohOjFJL1Qy6MQa8kbZHRMWFkElngAmU2znesclWW7v62ypfxNZVkCGD6dzS4A", items: 3, amount: "1,450.00", payment: "UPI", date: "Oct 24, 02:30 PM", status: "Printing", statusColor: "bg-secondary/10 text-secondary", dotColor: "bg-secondary animate-pulse", filesOk: false },
  { id: "#PX-2023-8898", name: "Rahul Sharma", phone: "+91 99887 76655", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAEBBZsI-ob-tQR-mGNU58JTyFWj3pBnzEdS4Q_TaFRgPXHt6J3aVL169ZNMtsRFGWEnlmFDIxBvxPlOr28-qUSlL2F546FF26LkP_McuytfzD3qoIYim4HH-t_XLhqosJPsMkZJYzahyoPQxU2JdSd9O_vbuSUs_DrfA19v5NKmPNfiiDdHh9bL1FGm94vFQuuJsHQcU_BucMxpv-6P5PO2h3IUlpWsNrAghIPopX2WNXsi_Ftlf3eNeaEMkjTaEm_s5GPzZHmtdk", items: 12, amount: "14,200.00", payment: "Card", date: "Oct 24, 11:15 AM", status: "Design Review", statusColor: "bg-blue-100 text-blue-700", dotColor: "bg-blue-700", filesOk: true },
  { id: "#PX-2023-8895", name: "Ananya Singh", phone: "+91 90011 22334", initials: "AS", items: 1, amount: "299.00", payment: "Wallet", date: "Oct 24, 09:45 AM", status: "Delivered", statusColor: "bg-emerald-100 text-emerald-700", dotColor: "bg-emerald-700", filesOk: true },
  { id: "#PX-2023-8890", name: "Vikram Mehta", phone: "+91 88877 66554", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCMQDilQXo94Gkz_6gUkJHWXAtogmL4XILxlv9ekdCZSKgBaMOdNsFfO2uUm0SnwAUmfL1Cj6z4A7sAVShe8__EKKq2Lpgb4KmlZNOMudFRhwLf2jYjXJ8QfL0kx9U8Y-FA-3RX2f8-dQ0K0_QYBM9_lQByuynpNmOLlKr6pbRD-pUvIhZmFaKvYMCpAlT7_nAsbvG3c_Li822g4m6cOIeyrPFn-o-9v9_yx_tSlw4Fm9r2UlPltvTV_CcKbu-bTr29uzIVv4kCtrM", items: 5, amount: "2,100.00", payment: "UPI", date: "Oct 23, 06:10 PM", status: "Placed", statusColor: "bg-orange-100 text-orange-700", dotColor: "bg-orange-700", filesOk: false },
];

export default function AdminOrders() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">Orders Management</h1>
        <p className="font-body-md text-on-surface-variant">1,248 total orders</p>
      </div>

      {/* Toolbar */}
      <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/30 space-y-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="relative w-full lg:w-96">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
            <input className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-outline-variant focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all text-body-md bg-surface" placeholder="Search Order #, customer, phone..." type="text" />
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-outline-variant bg-surface cursor-pointer hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined text-sm">calendar_today</span><span className="text-sm font-medium">Oct 01 - Oct 31</span><span className="material-symbols-outlined text-sm">expand_more</span>
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-outline-variant bg-surface hover:bg-surface-container transition-colors font-button text-sm"><span className="material-symbols-outlined text-sm">sort</span> Sort</button>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-outline-variant bg-surface hover:bg-surface-container transition-colors font-button text-sm"><span className="material-symbols-outlined text-sm">download</span> Export</button>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors font-button text-sm"><span className="material-symbols-outlined text-sm">inventory</span> Bulk Status Update</button>
          </div>
        </div>
        <div className="overflow-x-auto no-scrollbar -mx-2 px-2">
          <div className="flex items-center gap-2 min-w-max pb-1">
            {statusFilters.map(([label, count, active]) => (
              <button key={label} className={`px-4 py-2 rounded-full font-label-caps text-label-caps flex items-center gap-2 transition-all ${active ? "bg-primary-container text-on-primary-container" : "hover:bg-surface-container-high text-on-surface-variant"}`}>
                {label} <span className={`px-2 rounded-full ${active ? "bg-primary/10" : "bg-surface-variant/50"}`}>{count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant">
                <th className="px-6 py-4 w-12"><input className="rounded border-outline-variant text-secondary focus:ring-secondary" type="checkbox" /></th>
                {["Order #", "Customer", "Items", "Amount (₹)", "Payment", "Placed Date", "Status", "Files", ""].map((h, i) => (
                  <th key={i} className={`px-6 py-4 font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider ${h === "Items" || h === "Files" ? "text-center" : ""} ${h === "" ? "text-right" : ""}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-surface-container-low transition-colors">
                  <td className="px-6 py-4"><input className="rounded border-outline-variant text-secondary focus:ring-secondary" type="checkbox" /></td>
                  <td className="px-6 py-4"><Link href="/admin/orders/PX-2023-8901" className="font-bold text-secondary cursor-pointer hover:underline">{r.id}</Link></td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {r.img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img className="w-8 h-8 rounded-full object-cover" alt={r.name} src={r.img} />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-xs font-bold">{r.initials}</div>
                      )}
                      <div><p className="font-semibold text-primary">{r.name}</p><p className="text-[11px] text-on-surface-variant">{r.phone}</p></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center text-sm">{r.items}</td>
                  <td className="px-6 py-4 font-bold">{r.amount}</td>
                  <td className="px-6 py-4"><span className="text-xs px-2 py-1 bg-surface-container rounded font-medium">{r.payment}</span></td>
                  <td className="px-6 py-4 text-sm">{r.date}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${r.statusColor}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${r.dotColor}`}></span>{r.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`material-symbols-outlined ${r.filesOk ? "text-emerald-500" : "text-error"}`} title={r.filesOk ? "All Files Approved" : "Awaiting File Upload"}>{r.filesOk ? "check_circle" : "warning"}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href="/admin/orders/PX-2023-8901" className="p-1.5 hover:bg-surface-container rounded-lg transition-colors text-on-surface-variant" title="View Details"><span className="material-symbols-outlined text-sm">visibility</span></Link>
                      <button className="p-1.5 hover:bg-secondary/10 hover:text-secondary rounded-lg transition-colors text-on-surface-variant" title="Advance Status"><span className="material-symbols-outlined text-sm">arrow_forward_ios</span></button>
                    </div>
                  </td>
                </tr>
              ))}
              <tr className="opacity-80"><td className="px-6 py-10" colSpan={10}><div className="flex flex-col items-center justify-center text-outline-variant italic"><span className="text-xs">Additional 1,244 records available</span></div></td></tr>
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-outline-variant">
          <div className="text-sm text-on-surface-variant">Showing <span className="font-semibold text-primary">1-10</span> of <span className="font-semibold text-primary">1,248</span> orders</div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg border border-outline-variant bg-surface hover:bg-surface-container transition-colors"><span className="material-symbols-outlined text-sm">chevron_left</span></button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-secondary text-white font-bold text-sm">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container text-on-surface-variant text-sm transition-colors">2</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container text-on-surface-variant text-sm transition-colors">3</button>
            <span className="text-on-surface-variant px-1">...</span>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container text-on-surface-variant text-sm transition-colors">125</button>
            <button className="p-2 rounded-lg border border-outline-variant bg-surface hover:bg-surface-container transition-colors"><span className="material-symbols-outlined text-sm">chevron_right</span></button>
          </div>
        </div>
      </div>
    </div>
  );
}
