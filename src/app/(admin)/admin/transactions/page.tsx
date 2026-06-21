import type { Metadata } from "next";

export const metadata: Metadata = { title: "PrintX Admin | Wallet & Transactions" };

const summary: [string, string, string, string][] = [
  ["Wallet Liability", "₹8,42,500", "Total customer balances", "text-primary"],
  ["Top-ups (30d)", "+₹3,12,000", "Via UPI / Card / NetBank", "text-emerald-600"],
  ["Order Debits", "−₹2,84,300", "Paid from wallet", "text-error"],
  ["Refunds", "+₹12,400", "Approved Reversals", "text-emerald-600"],
  ["Bonus Issued", "₹5,000", "Promotional Credits", "text-primary"],
];

const bars = ["40", "55", "25", "70", "45", "60", "85", "30", "20", "50", "95", "75", "60", "40", "55", "25", "70", "45", "60", "85", "30", "20", "50", "95", "75", "60", "100", "15", "40", "65"];

type Txn = {
  when: string; date: string; customer: string; img: string; type: string; typeClass: string;
  amount: string; amountClass: string; balance: string; ref: string; desc: string;
};

const txns: Txn[] = [
  { when: "Just Now", date: "24 Aug, 10:42 AM", customer: "Aditi Sharma", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBy47y2GKV07csJsQSlQytn7edLE0sairEcL5xkZIoz-TDg63gLdO2TR2gdQElQAh1t6nddyEPf8p4oCsxjhnxY71s-roUl9bdE36K0yBenAw-T1xsy4W0iwK9Az5N8GQeffxb9RDzb9hbaLUZrL-uOkLnaycgbfnmn8PUsfUgxLOTzF3dXST-7ND6mQUWTw1wXQO4hxlE8EwrhhrrKgHF4TpiMSZzznwVvhULKv598ZKHh7FOU1eQiUgqkHapGN3I-iz1igsx-FCk", type: "Credit", typeClass: "bg-emerald-50 text-emerald-700", amount: "+₹5,000.00", amountClass: "text-emerald-600", balance: "₹12,450.00", ref: "TXN-94852", desc: "Wallet Top-up via UPI" },
  { when: "2 hours ago", date: "24 Aug, 08:15 AM", customer: "Rahul Mehta", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAEHq04hrG2VM459s3nknEpPr3QAr_UtGJXOVozdHlDf1Zt2KauR0HFMV8xf5kDd0RDjejoBCs0NiPTIoAFoIfv2Fli9sczisGK5vjpakEVvXIxehnYdUm9igagaKSbEFqnI0BDG_ggM3F9lfF13FJ-ADJgx86Q5YOkPsqYvQKhfOuomXqq78XzNnan76e_IJQnau2S_xXcSyMXi61aehYcQ_CyNGmDhb6l563skOYt4LYCTtO-CUdX8bDa-gCY7-63fH1cSTJUzwk", type: "Debit", typeClass: "bg-red-50 text-red-700", amount: "-₹12,840.00", amountClass: "text-error", balance: "₹2,100.00", ref: "PX-2024-08471", desc: "Order #PX-2024-08471 Debit" },
  { when: "Yesterday", date: "23 Aug, 04:30 PM", customer: "Skyline Corp", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuB6mQMIhs3gbhbxudYdE509Nv9RMn8KbebN9gHJ-w9d2X3vHUfPCiKUFSSNex_rr5I7pE1amYTLY28jS691J0s9Bvd7Lkp3piMoQr_6nFZZRpeYcLZqjmy7EwsnEN-jMnafWntiXFTAJZ1hygK8F5A70cvWB2UZivboliJGHDA1atXOqtcdChVBBeIe6tozBl3-V40KiYv0BR616K_J7nVzddUxh7qbcwHf0_XYf6tpbLdBuTKHrTbqAlmOX77eQyYKQy4pMf7YrJo", type: "Refund", typeClass: "bg-blue-50 text-blue-700", amount: "+₹2,400.00", amountClass: "text-blue-600", balance: "₹45,200.00", ref: "RF-2024-1102", desc: "Partial Refund (Cancel Item)" },
  { when: "Yesterday", date: "23 Aug, 11:20 AM", customer: "Vikram Roy", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCfKhTulsmKGEdlW6AYJG9xgMrPPXx4IGtJmLfdHpcNLy9kYuP0dRg0SRsVGH3_C6Yw8YigVx4dO7eVQnw8g7bofqASxFD2x7t1Wm7QsLUcqFeE31Bh40qa9lEvK7mkmw59_FjykrMRV5Za0IOKftkcZ-9FBtNHnmj8ZZEclSdXMbvjSofAuHipveEfgI_nQhSYQU7hoeQ_G8ZeDaciTSEmLDC19YdsCVB96a8-eIfmLScSgbsaLQK5AduRyx7uyRKKcpV1Ie2h12Y", type: "Bonus", typeClass: "bg-purple-50 text-purple-700", amount: "₹500.00", amountClass: "text-purple-600", balance: "₹1,500.00", ref: "PR-REWARD-88", desc: "Referral Bonus Reward" },
];

export default function AdminTransactions() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">Wallet &amp; Transactions</h1>
        <p className="font-body-md text-on-surface-variant">Ledger of all wallet activity across customers.</p>
      </div>

      {/* Summary */}
      <section className="grid grid-cols-2 lg:grid-cols-5 gap-6">
        {summary.map(([label, value, sub, color]) => (
          <div key={label} className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col justify-between">
            <p className="font-label-caps text-label-caps text-on-surface-variant mb-2">{label}</p>
            <div className="flex flex-col"><h4 className={`font-headline-md text-headline-md ${color}`}>{value}</h4><p className="text-xs text-on-surface-variant mt-1">{sub}</p></div>
          </div>
        ))}
      </section>

      {/* Chart */}
      <section className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-outline-variant/20 flex flex-col sm:flex-row justify-between gap-4 sm:items-center">
          <div>
            <h3 className="font-headline-md text-headline-md text-primary">Top-up &amp; Spending Trends</h3>
            <p className="text-on-surface-variant text-body-md">Daily financial activity over the last 30 days</p>
          </div>
          <div className="flex space-x-2">
            <div className="flex items-center space-x-2 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full"><span className="w-2 h-2 bg-emerald-500 rounded-full"></span><span>Credits</span></div>
            <div className="flex items-center space-x-2 px-3 py-1 bg-red-50 text-red-700 text-xs font-semibold rounded-full"><span className="w-2 h-2 bg-red-500 rounded-full"></span><span>Debits</span></div>
          </div>
        </div>
        <div className="p-6 h-[300px]">
          <div className="h-full flex items-end justify-between gap-1">
            {bars.map((h, i) => (
              <div key={i} className={`flex-1 rounded-t-md ${i % 5 === 2 || i % 9 === 5 ? "bg-red-200" : "bg-emerald-200"}`} style={{ height: `${h}%` }}></div>
            ))}
          </div>
        </div>
      </section>

      {/* Transactions */}
      <section className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden">
        <div className="p-6 bg-surface-container-low/30 flex flex-wrap items-center justify-between gap-4 border-b border-outline-variant/20">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
              <input className="w-full bg-white border border-outline-variant rounded-lg py-1.5 pl-9 pr-4 text-sm focus:ring-2 focus:ring-secondary-container" placeholder="Search by customer/ref..." type="text" />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-outline-variant rounded-lg bg-white hover:bg-surface-container-low transition-colors text-sm"><span className="material-symbols-outlined text-sm">calendar_month</span><span>Last 30 Days</span><span className="material-symbols-outlined text-sm">expand_more</span></button>
            <button className="flex items-center gap-2 px-4 py-2 border border-outline-variant rounded-lg bg-white hover:bg-surface-container-low transition-colors text-sm"><span className="material-symbols-outlined text-sm">filter_list</span><span>Type: All</span><span className="material-symbols-outlined text-sm">expand_more</span></button>
          </div>
          <button className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-semibold"><span className="material-symbols-outlined text-sm">download</span><span>Export CSV</span></button>
        </div>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50">{["Date", "Customer", "Type", "Amount", "Balance After", "Reference", "Description", ""].map((h) => (
                <th key={h} className="px-6 py-4 font-label-caps text-label-caps text-on-surface-variant">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {txns.map((t) => (
                <tr key={t.ref} className="hover:bg-surface-container-low transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap"><p className="text-sm font-medium">{t.when}</p><p className="text-xs text-on-surface-variant">{t.date}</p></td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-surface-container">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img className="w-full h-full object-cover" alt={t.customer} src={t.img} />
                      </div>
                      <span className="text-sm font-semibold">{t.customer}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4"><span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${t.typeClass}`}>{t.type}</span></td>
                  <td className="px-6 py-4"><span className={`text-sm font-bold ${t.amountClass}`}>{t.amount}</span></td>
                  <td className="px-6 py-4 text-sm font-medium">{t.balance}</td>
                  <td className="px-6 py-4 text-sm font-mono text-on-surface-variant">{t.ref}</td>
                  <td className="px-6 py-4 text-sm text-on-surface-variant">{t.desc}</td>
                  <td className="px-6 py-4 text-right"><button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">more_vert</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 bg-surface-container-low/30 flex items-center justify-between">
          <p className="text-xs text-on-surface-variant font-medium">Showing 1 to 4 of 1,240 results</p>
          <div className="flex items-center space-x-2">
            <button className="w-8 h-8 flex items-center justify-center border border-outline-variant rounded hover:bg-white transition-colors text-on-surface-variant"><span className="material-symbols-outlined text-sm">chevron_left</span></button>
            <button className="w-8 h-8 flex items-center justify-center bg-primary text-white rounded text-xs font-bold shadow-sm">1</button>
            <button className="w-8 h-8 flex items-center justify-center border border-outline-variant rounded hover:bg-white transition-colors text-xs font-medium">2</button>
            <button className="w-8 h-8 flex items-center justify-center border border-outline-variant rounded hover:bg-white transition-colors text-xs font-medium">3</button>
            <span className="px-1 text-on-surface-variant">...</span>
            <button className="w-8 h-8 flex items-center justify-center border border-outline-variant rounded hover:bg-white transition-colors text-on-surface-variant"><span className="material-symbols-outlined text-sm">chevron_right</span></button>
          </div>
        </div>
      </section>
    </div>
  );
}
