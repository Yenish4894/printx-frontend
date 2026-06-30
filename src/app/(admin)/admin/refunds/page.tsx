import type { Metadata } from "next";

export const metadata: Metadata = { title: "Bhagini Graphics Admin | Refunds" };

const tabs: [string, string, boolean][] = [
  ["Pending", "12", true],
  ["Processing", "5", false],
  ["Credited", "164", false],
  ["Rejected", "8", false],
];

type Refund = {
  id: string; customer: string; img: string; order: string; amount: string; reason: string;
  status: string; statusColor: string; pending: boolean;
};

const refunds: Refund[] = [
  { id: "#REF-2024-001", customer: "Meera Kapoor", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAS8hVOgXbNUQel-sSeWMv8jZ_tlKQzrd8p5HkMX70GlUtEbnZ8lOc2BSYr2G6l3jQUP3U1GWU9QQtbslouWp4xr5Ms0TdepYu3gYnjx8k9SPFCGYQkyHIztZGomd6lq2vz5SzzIcFVn6C_bPHx2IKWPDYS_4Qsdrhd63Vpye13xsi5oQrjXp032GT6rrM_iJTVpegcVfuiVwWEc6VgPYWAjhlrp7DUBNRqpRS5slmkNV6u0v4DGZ9B_rnsmZ84g2H51XUspwItD5c", order: "#PX-2024-08471", amount: "₹1,450.00", reason: "Damaged during shipping", status: "PENDING", statusColor: "bg-secondary-fixed text-on-secondary-fixed", pending: true },
  { id: "#REF-2024-002", customer: "Arjun Singh", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBMjeExVitdUPGt7aDDEiaH0usrLvT4KP4P8oGhhyGmtPxAD8boYqtDKR8GK0swudAq83eEhK2QMPdyJS62mRD9a_qJDbYdC4KS60xbdprs8th43JbwWADgZVt1ps-4b24qJIb9MAA_KZLkYyJ8rgqcztN6O6Ws1vpR7nMsPGVgWaVNheUKl7DVq0KSf47qX-OZgK6iE5eNzlVnbjcOHkx98yXMIgeTRr7YrGfgsSqCLLisXzPDEyeJ4jT_WoxA5I_rg8dJc9fjuyc", order: "#PX-2024-08512", amount: "₹3,210.00", reason: "Wrong paper finish", status: "PENDING", statusColor: "bg-secondary-fixed text-on-secondary-fixed", pending: true },
  { id: "#REF-2024-003", customer: "Sarah Jenkins", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuB2GSTOoMoOdyV0GvrONJW5z2gR-uMKUR67C4OHMbQzluHH1BJWprNohIAeTkT2y3KMitavuU50klBqm7T_LG4F8XhXJgFETzCdW53imuLxDlaSMvRyYgRk8FU_YMNBhi-3rfmIK1Ro3GZfA40F21h_AzQ0jNR5Zy0GPzYojQrZb5sdM7AyN3yE7FlbBpLH0j1GomrqlELs4LCaCndRDB2n5OhY1LzIcBMaAgn2Rsf_io7StHQu87yxmmrsMpWis7kaN_XKMhBKIhc", order: "#PX-2024-08399", amount: "₹980.00", reason: "Color mismatch", status: "PROCESSING", statusColor: "bg-tertiary-fixed text-on-tertiary-fixed", pending: false },
  { id: "#REF-2024-004", customer: "Rahul Mehta", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBPuFDmaRFAjdlltDZ67gUAB5qhoxIpATyq26ySWZUOwI-IAU_wBj1BX6rjd8z2uMkS5d9RWp0aYS7kQopcz6hQYBSuxhp3CfgzD6y1PfuMCClaAJviuHM6w4wIjzHfT6OliZEQXjWEesLnLOCpquplf0YM8dk3KfHf88DmjV3k9CzsQAicgyCnVXwqIRJgz2F6wNFFys3Rjdx1O_lJdSWR_LuUTsqk_w7d94v_J3v1BBIMdpIcz4zJ2DEo9vEKvtzx5TnPHL_0SYw", order: "#PX-2024-08123", amount: "₹2,100.00", reason: "Late delivery", status: "CREDITED", statusColor: "bg-surface-container-highest text-on-surface-variant", pending: false },
];

export default function AdminRefunds() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">Refunds</h1>
        <p className="font-body-md text-on-surface-variant">189 total refund requests</p>
      </div>

      <div className="flex items-center gap-2 border-b border-outline-variant overflow-x-auto no-scrollbar">
        {tabs.map(([label, count, active]) => (
          <button key={label} className={`px-6 py-3 whitespace-nowrap font-button text-sm flex items-center gap-2 border-b-2 transition-colors ${active ? "border-secondary text-secondary font-bold" : "border-transparent text-on-surface-variant hover:text-secondary"}`}>
            {label} <span className={`px-2 rounded-full text-xs ${active ? "bg-secondary/10" : "bg-surface-variant/50"}`}>{count}</span>
          </button>
        ))}
      </div>

      <div className="bg-surface-container-lowest rounded-xl premium-shadow overflow-hidden border border-outline-variant/30">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant">
                {["Refund ID", "Customer", "Order #", "Amount", "Reason", "Status", "Actions"].map((h) => (
                  <th key={h} className={`px-6 py-4 font-label-caps text-label-caps text-on-surface-variant uppercase ${h === "Status" ? "text-center" : ""} ${h === "Actions" ? "text-right" : ""}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {refunds.map((r) => (
                <tr key={r.id} className={`hover:bg-surface-bright transition-colors group ${!r.pending ? "opacity-80" : ""}`}>
                  <td className="px-6 py-5 font-body-md text-body-md font-bold text-primary">{r.id}</td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img className="w-full h-full object-cover" alt={r.customer} src={r.img} />
                      </div>
                      <span className="font-body-md text-body-md text-on-surface">{r.customer}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5"><a className="text-secondary font-semibold hover:underline" href="#">{r.order}</a></td>
                  <td className="px-6 py-5 font-body-md text-body-md font-bold text-primary">{r.amount}</td>
                  <td className="px-6 py-5"><p className="text-body-md text-on-surface-variant max-w-[200px] truncate" title={r.reason}>{r.reason}</p></td>
                  <td className="px-6 py-5 text-center"><span className={`inline-flex px-2.5 py-1 rounded-full text-[12px] font-bold ${r.statusColor}`}>{r.status}</span></td>
                  <td className="px-6 py-5 text-right">
                    {r.pending ? (
                      <div className="flex gap-2 justify-end">
                        <button className="px-4 py-1.5 primary-gradient text-white rounded font-button text-[14px]">Approve</button>
                        <button className="px-4 py-1.5 border border-outline-variant text-on-surface-variant hover:bg-surface-container-high rounded font-button text-[14px]">Reject</button>
                      </div>
                    ) : (
                      <button className="text-on-surface-variant hover:text-secondary p-2"><span className="material-symbols-outlined">more_vert</span></button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 bg-surface-container-lowest border-t border-outline-variant flex items-center justify-between">
          <p className="text-label-caps text-on-surface-variant">Showing 1 to 10 of 189 results</p>
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant hover:bg-surface-variant/10"><span className="material-symbols-outlined text-sm">chevron_left</span></button>
            <button className="w-8 h-8 flex items-center justify-center rounded bg-secondary text-white font-bold text-sm">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant hover:bg-surface-variant/10 text-sm">2</button>
            <button className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant hover:bg-surface-variant/10 text-sm">3</button>
            <span className="px-2 text-on-surface-variant">...</span>
            <button className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant hover:bg-surface-variant/10"><span className="material-symbols-outlined text-sm">chevron_right</span></button>
          </div>
        </div>
      </div>
    </div>
  );
}
