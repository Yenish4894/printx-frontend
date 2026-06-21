import type { Metadata } from "next";

export const metadata: Metadata = { title: "PrintX | Wallet Management" };

const fill1 = { fontVariationSettings: "'FILL' 1" } as const;

const amounts = ["₹500", "₹1,000", "₹2,000", "₹5,000", "₹10,000", "₹25,000"];

const transactions = [
  { icon: "add_circle", iconBg: "bg-green-100 text-green-600", title: "Top up via UPI", meta: "ID: TXN-98234-AX • 24 Oct 2024, 11:30 AM", type: "Credit", typeBg: "bg-green-100 text-green-700", amount: "+₹5,000.00", amountColor: "text-green-600", balance: "₹5,970.00" },
  { icon: "shopping_cart", iconBg: "bg-red-100 text-red-600", title: "Order Payment #PRX-4421", meta: "ID: TXN-98201-AX • 23 Oct 2024, 04:15 PM", type: "Debit", typeBg: "bg-red-100 text-red-700", amount: "-₹4,200.00", amountColor: "text-red-600", balance: "₹970.00" },
  { icon: "stars", iconBg: "bg-amber-100 text-amber-600", title: "Loyalty Bonus Applied", meta: "ID: TXN-98155-AX • 21 Oct 2024, 09:00 AM", type: "Bonus", typeBg: "bg-amber-100 text-amber-700", amount: "+₹250.00", amountColor: "text-green-600", balance: "₹5,170.00", badge: true },
];

const chart: [string, string, string][] = [
  ["MAY", "h-full", "h-2/3"],
  ["JUN", "h-1/2", "h-3/4"],
  ["JUL", "h-full", "h-1/3"],
  ["AUG", "h-2/3", "h-1/2"],
  ["SEP", "h-full", "h-4/5"],
  ["OCT", "h-1/4", "h-full"],
];

const categories: [string, string, string][] = [
  ["Business Cards & Stationery", "45%", "bg-secondary"],
  ["Marketing Materials", "30%", "bg-secondary/70"],
  ["Custom Packaging", "15%", "bg-secondary/40"],
  ["Gifts & Decor", "10%", "bg-secondary/20"],
];

const toggle = (
  <label className="relative inline-flex items-center cursor-pointer">
    <input defaultChecked className="sr-only peer" type="checkbox" />
    <div className="w-11 h-6 bg-white/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
  </label>
);

export default function WalletManagement() {
  return (
    <main className="p-gutter md:p-margin-desktop max-w-container-max mx-auto">
      {/* Wallet header */}
      <div className="header-deep-gradient rounded-xl p-8 mb-8 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl relative overflow-hidden">
        <div className="z-10">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-headline-lg font-headline-lg">My PrintX Wallet</h1>
            <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Active
            </span>
          </div>
          <div className="flex gap-4">
            <div className="bg-white/10 px-3 py-1 rounded-lg"><p className="text-[10px] text-white/60 uppercase font-bold tracking-tighter">Total Added</p><p className="text-body-md font-bold">₹15,000</p></div>
            <div className="bg-white/10 px-3 py-1 rounded-lg"><p className="text-[10px] text-white/60 uppercase font-bold tracking-tighter">Total Spent</p><p className="text-body-md font-bold">₹14,030</p></div>
            <div className="bg-white/10 px-3 py-1 rounded-lg border border-secondary/40"><p className="text-[10px] text-secondary-container uppercase font-bold tracking-tighter">Current Balance</p><p className="text-body-md font-extrabold text-secondary-container">₹970</p></div>
          </div>
        </div>
        <div className="flex flex-col items-end z-10">
          <span className="text-white/40 text-label-caps mb-1">Available for orders</span>
          <span className="text-display-lg font-display-lg leading-none">₹970.00</span>
        </div>
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-secondary/20 rounded-full blur-[100px]"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Left */}
        <div className="lg:col-span-8 space-y-gutter">
          {/* Card + stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
            <div className="primary-accent-gradient p-6 rounded-2xl text-white shadow-2xl relative flex flex-col justify-between h-56 transition-transform hover:-translate-y-1">
              <div className="flex justify-between items-start">
                <div><p className="text-xs opacity-80 font-bold uppercase tracking-widest">Available Balance</p><h3 className="text-headline-md">₹970.00</h3></div>
                <span className="material-symbols-outlined text-4xl">contactless</span>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-4"><div className="w-10 h-8 bg-white/20 rounded-md"></div><div className="w-10 h-8 bg-white/10 rounded-md"></div></div>
                <div className="flex justify-between items-end">
                  <div><p className="text-[10px] opacity-60 uppercase font-bold">Card Holder</p><p className="text-body-md font-bold">Priya Mehta</p></div>
                  <div><p className="text-[10px] opacity-60 uppercase font-bold text-right">Wallet ID</p><p className="text-body-md font-mono">WLT-PM-2024</p></div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 grid-rows-2 gap-4">
              <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm border border-outline-variant/30 flex flex-col justify-center hover:shadow-md transition-shadow">
                <p className="text-on-surface-variant text-label-caps uppercase mb-1">Savings</p><p className="text-headline-md text-secondary font-bold">₹1,240</p><p className="text-[10px] text-green-600 font-bold">↑ 12% vs last month</p>
              </div>
              <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm border border-outline-variant/30 flex flex-col justify-center hover:shadow-md transition-shadow">
                <p className="text-on-surface-variant text-label-caps uppercase mb-1">Prints Done</p><p className="text-headline-md text-primary font-bold">42</p><p className="text-[10px] text-on-surface-variant opacity-60">Corporate Tier</p>
              </div>
              <div className="bg-primary-container col-span-2 p-4 rounded-xl shadow-sm flex items-center justify-between">
                <div><p className="text-on-primary-container text-label-caps uppercase mb-1">Bonus Credits</p><p className="text-body-lg text-white font-bold">₹150.00</p></div>
                <div className="w-12 h-12 rounded-full border-4 border-secondary/30 border-t-secondary spin-slow flex items-center justify-center"><span className="material-symbols-outlined text-secondary">redeem</span></div>
              </div>
            </div>
          </div>

          {/* Add money */}
          <section className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm border border-outline-variant/30">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary"><span className="material-symbols-outlined" style={fill1}>account_balance_wallet</span></div>
              <div><h2 className="text-headline-md text-primary">Add Money to Wallet</h2><p className="text-on-surface-variant text-body-md opacity-70">Top up your balance for instant one-click checkouts.</p></div>
            </div>
            <div className="mb-8">
              <label className="block text-label-caps text-on-surface-variant mb-4 uppercase">Select Amount</label>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
                {amounts.map((a) => (
                  <button key={a} className={a === "₹2,000" ? "py-3 px-2 border-2 border-secondary bg-secondary/5 rounded-lg font-bold text-secondary transition-all" : "py-3 px-2 border border-outline-variant rounded-lg font-bold text-on-surface hover:border-secondary hover:text-secondary transition-all"}>{a}</button>
                ))}
              </div>
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg mb-6 flex items-center gap-3">
                <span className="material-symbols-outlined text-amber-600">stars</span>
                <span className="text-amber-800 text-body-md font-bold">Add ₹5,000+ and get 5% bonus credits instantly!</span>
              </div>
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="w-full md:w-1/2">
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">₹</span>
                    <input className="w-full pl-8 pr-4 py-4 rounded-xl border border-outline-variant focus:border-secondary focus:ring-0 text-headline-md font-bold transition-all" placeholder="Enter custom amount" type="number" defaultValue={2000} />
                  </div>
                  <p className="text-[10px] text-on-surface-variant opacity-60 mt-2 uppercase font-bold">min ₹100 / max ₹1,00,000</p>
                </div>
                <div className="w-full md:w-1/2 bg-surface-container p-4 rounded-xl border border-dashed border-outline-variant">
                  <p className="text-label-caps text-on-surface-variant uppercase mb-2">After Top-Up Preview</p>
                  <div className="flex justify-between items-center"><span className="text-body-md text-on-surface-variant">New Balance</span><span className="text-headline-md font-bold text-green-600">₹2,970.00</span></div>
                </div>
              </div>
            </div>
            <div className="mb-8">
              <label className="block text-label-caps text-on-surface-variant mb-4 uppercase">Pay Via</label>
              <div className="space-y-3">
                <label className="flex items-center justify-between p-4 border border-secondary bg-secondary/5 rounded-xl cursor-pointer">
                  <div className="flex items-center gap-4">
                    <input defaultChecked className="text-secondary focus:ring-secondary" name="topup" type="radio" />
                    <div className="flex flex-col"><span className="font-bold text-on-surface">UPI / GPay / PhonePe</span><span className="text-xs text-secondary font-bold uppercase tracking-tighter">Recommended &amp; Instant</span></div>
                  </div>
                </label>
                {[["Debit / Credit Card", "credit_card"], ["Net Banking", "account_balance"], ["Paytm", "wallet"]].map(([label, icon]) => (
                  <label key={label} className="flex items-center justify-between p-4 border border-outline-variant rounded-xl cursor-pointer hover:bg-surface-variant/20 transition-all">
                    <div className="flex items-center gap-4"><input className="text-secondary focus:ring-secondary" name="topup" type="radio" /><span className="font-bold text-on-surface">{label}</span></div>
                    <span className="material-symbols-outlined text-on-surface-variant">{icon}</span>
                  </label>
                ))}
              </div>
            </div>
            <button className="w-full py-5 bg-[#2e7d32] text-white rounded-xl font-bold text-lg shadow-lg hover:bg-[#1b5e20] transition-all active:scale-[0.98] flex items-center justify-center gap-3">
              <span className="material-symbols-outlined">add_circle</span> Add ₹2,000 to Wallet
            </button>
          </section>

          {/* Transaction history */}
          <section className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 overflow-hidden">
            <div className="p-8 border-b border-outline-variant/30 flex flex-col md:flex-row justify-between items-center gap-4">
              <h2 className="text-headline-md text-primary">Transaction History</h2>
              <div className="flex items-center gap-2">
                <div className="flex bg-surface-container p-1 rounded-lg">
                  {["All", "Credits", "Debits", "Refunds"].map((t, i) => (
                    <button key={t} className={i === 0 ? "px-4 py-1.5 bg-white text-secondary rounded-md text-label-caps font-bold shadow-sm" : "px-4 py-1.5 text-on-surface-variant hover:text-on-surface rounded-md text-label-caps font-bold transition-all"}>{t}</button>
                  ))}
                </div>
                <button className="flex items-center gap-2 px-4 py-1.5 border border-outline-variant rounded-lg text-label-caps font-bold hover:bg-surface-variant/10"><span className="material-symbols-outlined text-sm">download</span> Export</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface-container-low">
                  <tr>
                    <th className="px-8 py-4 text-left text-label-caps text-on-surface-variant opacity-60 font-bold uppercase">Transaction Details</th>
                    <th className="px-8 py-4 text-center text-label-caps text-on-surface-variant opacity-60 font-bold uppercase">Type</th>
                    <th className="px-8 py-4 text-right text-label-caps text-on-surface-variant opacity-60 font-bold uppercase">Amount</th>
                    <th className="px-8 py-4 text-right text-label-caps text-on-surface-variant opacity-60 font-bold uppercase">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {transactions.map((t) => (
                    <tr key={t.title} className="hover:bg-surface-container/30 transition-all">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${t.iconBg}`}><span className="material-symbols-outlined">{t.icon}</span></div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-on-surface">{t.title}</p>
                              {t.badge && <span className="bg-secondary text-white text-[8px] px-1.5 py-0.5 rounded uppercase font-extrabold">Bonus</span>}
                            </div>
                            <p className="text-[10px] text-on-surface-variant opacity-60">{t.meta}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-center"><span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${t.typeBg}`}>{t.type}</span></td>
                      <td className={`px-8 py-5 text-right font-bold ${t.amountColor}`}>{t.amount}</td>
                      <td className="px-8 py-5 text-right font-mono text-on-surface-variant">{t.balance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="p-6 text-center border-t border-outline-variant/30"><button className="text-secondary font-bold text-label-caps hover:underline">View All Transactions</button></div>
            </div>
          </section>
        </div>

        {/* Right */}
        <div className="lg:col-span-4 space-y-gutter">
          <div className="grid grid-cols-2 gap-4">
            {[["add_card", "Add Money"], ["receipt_long", "Statement"], ["description", "Invoices"], ["contact_support", "Support"]].map(([icon, label]) => (
              <button key={label} className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/30 hover:border-secondary hover:-translate-y-1 transition-all flex flex-col items-center gap-3">
                <span className="material-symbols-outlined text-secondary text-3xl">{icon}</span>
                <span className="text-label-caps font-bold">{label}</span>
              </button>
            ))}
          </div>

          {/* Refunds */}
          <section className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/30">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-headline-md text-primary">Refunds</h3>
              <div className="flex gap-2">
                <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-[10px] font-bold">1 pending</span>
                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold">3 processed</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-surface-container rounded-xl border-l-4 border-amber-500">
                <div className="flex justify-between items-start mb-2"><span className="text-body-md font-bold">Order #PRX-4390</span><span className="text-on-surface font-bold">₹1,450.00</span></div>
                <div className="flex justify-between items-center"><span className="text-[10px] text-amber-700 font-bold uppercase">Processing</span><span className="text-[10px] text-on-surface-variant opacity-60">ETA: 2-3 Days</span></div>
              </div>
              <div className="p-4 border border-outline-variant/30 rounded-xl">
                <div className="flex justify-between items-start mb-1"><span className="text-body-md font-bold opacity-60">Order #PRX-4102</span><span className="text-on-surface-variant font-bold">₹820.00</span></div>
                <span className="text-[10px] text-green-600 font-bold uppercase">Processed to Wallet</span>
              </div>
            </div>
          </section>

          {/* Saved payments */}
          <section className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/30">
            <h3 className="text-headline-md text-primary mb-6">Saved Payments</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border border-outline-variant rounded-xl hover:bg-surface-container transition-all">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-secondary">account_balance_wallet</span>
                  <div><p className="text-body-md font-bold">UPI Primary</p><p className="text-[10px] text-on-surface-variant opacity-60">mehta.priya@okaxis</p></div>
                </div>
                <span className="material-symbols-outlined text-secondary" style={fill1}>check_circle</span>
              </div>
              <div className="flex items-center justify-between p-3 border border-outline-variant rounded-xl hover:bg-surface-container transition-all opacity-80">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-on-surface-variant">credit_card</span>
                  <div><p className="text-body-md font-bold">HDFC Debit</p><p className="text-[10px] text-on-surface-variant opacity-60">**** 8821</p></div>
                </div>
              </div>
              <button className="w-full py-3 border-2 border-dashed border-outline-variant rounded-xl text-label-caps font-bold text-on-surface-variant hover:border-secondary hover:text-secondary transition-all flex items-center justify-center gap-2"><span className="material-symbols-outlined text-sm">add</span> Add New Method</button>
            </div>
          </section>

          {/* Settings */}
          <section className="bg-primary-container p-6 rounded-2xl shadow-sm text-white">
            <h3 className="text-headline-md mb-6">Wallet Settings</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div><p className="text-body-md font-bold">Auto Top-up</p><p className="text-[10px] text-white/50">Add ₹1,000 when below ₹200</p></div>
                {toggle}
              </div>
              <div className="flex items-center justify-between"><p className="text-body-md font-bold">Transaction Alerts</p>{toggle}</div>
              <div className="flex items-center justify-between"><p className="text-body-md font-bold">Low Balance Alert</p>{toggle}</div>
              <div className="pt-4 border-t border-white/10">
                <div className="flex justify-between items-center mb-2"><span className="text-label-caps text-white/60">Monthly Spending Limit</span><span className="text-label-caps font-bold">₹50,000</span></div>
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden"><div className="bg-secondary h-full w-[28%] rounded-full"></div></div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Insights */}
      <section className="mt-gutter">
        <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm border border-outline-variant/30">
          <h2 className="text-headline-md text-primary mb-8">Wallet Usage Insights</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Bar chart */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-body-md font-bold uppercase tracking-wider text-on-surface-variant">Credits vs Debits (6 Months)</h3>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-500"></span><span className="text-[10px] font-bold">Credits</span></div>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-secondary"></span><span className="text-[10px] font-bold">Debits</span></div>
                </div>
              </div>
              <div className="flex items-end justify-between h-48 gap-4 px-4 border-b border-outline-variant/30 pb-2">
                {chart.map(([m, credit, debit]) => (
                  <div key={m} className="flex flex-col gap-1 w-full items-center">
                    <div className="flex gap-1 items-end h-32">
                      <div className={`w-3 bg-green-400 rounded-t-sm ${credit}`}></div>
                      <div className={`w-3 bg-secondary/80 rounded-t-sm ${debit}`}></div>
                    </div>
                    <span className="text-[10px] font-bold text-on-surface-variant">{m}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Categories */}
            <div>
              <h3 className="text-body-md font-bold uppercase tracking-wider text-on-surface-variant mb-6">Spending by Product Category</h3>
              <div className="space-y-4">
                {categories.map(([label, pct, color]) => (
                  <div key={label}>
                    <div className="flex justify-between items-center mb-1"><span className="text-xs font-bold">{label}</span><span className="text-xs font-bold">{pct}</span></div>
                    <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden"><div className={`${color} h-full`} style={{ width: pct }}></div></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
