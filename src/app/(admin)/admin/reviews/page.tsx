import type { Metadata } from "next";

export const metadata: Metadata = { title: "Bhagini Graphics Admin | Reviews" };

const fill1 = { fontVariationSettings: "'FILL' 1" } as const;

function Stars({ n }: { n: number }) {
  return (
    <div className="flex text-secondary-container">
      {[0, 1, 2, 3, 4].map((i) => (
        <span key={i} className="material-symbols-outlined text-sm" style={i < n ? fill1 : undefined}>star</span>
      ))}
    </div>
  );
}

type Review = {
  product: string; img: string; customer: string; verified?: boolean; order: string; rating: number;
  comment: string; date: string; status: string; statusClass: string; rowClass: string; pending?: boolean;
};

const reviews: Review[] = [
  { product: "Business Cards - Matte", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCaa2-iDKwWRgW2NoupqNQDcchzF7CF7cTMhpZAgHLTXIjYPfUus-h93YclvPdPCSUFgST2xjBmsRdBQG0CyhOXemykZ4W8K0ul0rV5yslxKqtrb5OLOQXpBMfK_BZzqm6xvkhGTWSoy6jWr2WN9FDfL-r-n24DvRLD9Ddbb6o7QojST15a9CXaBL4B1Bdvr_2gRv9g6QAQF6l3joXLO-Gsdaea31lP63OhACT4JI1ziqVODFEoA8DDjSkH4n8e0uqYohngyMrLyqQ", customer: "Sarah Jenkins", verified: true, order: "Order #98321", rating: 5, comment: "The quality of the cardstock is absolutely phenomenal. I've ordered from four different places and Bhagini Graphics is by far the best...", date: "2 days ago", status: "Published", statusClass: "bg-green-100 text-green-700", rowClass: "" },
  { product: "Tri-fold Brochures", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBG7k1PUTM6kVIk7InT4BcsKefpJ1psY9EKLfPgub8QuJIJr7Dk9GExl_CH4Bok_Dt9wMCmOywCB7JTl980HELcnvEUbU1TUT2bE93TWQi07TYEuSemALdeUsZ4XJ25Rg5IaaODNTYz5J35ylX8wwXmX90J0PMFhF1NN46PzgGWsNRTPFtrE7x_efUuFdlCPWr5IEJWWVTzBrXiqGE8EpN2si1CD7t8PWPp3ZLR_CNTq76PNG83bu0EB37WvQz2bVfx0dR-qpyYvlw", customer: "Mark Stevens", order: "Order #98445", rating: 1, comment: "The colors were way off compared to what I saw on my screen. Very disappointed with the final result...", date: "5 hours ago", status: "Pending", statusClass: "border border-secondary text-secondary", rowClass: "bg-secondary/5", pending: true },
  { product: "Glossy Posters", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuB7sZgcR7lSs9S_KtZC-2j_guJtTUUs-UF1bNaev7nh97sEKmgpoJ1tOPZhDOTxTj3oPeXPTCVYek8eDuhOqYSOH6Yv2-2NQT35ZCnBh26hEEl5G-PEPCx--5qIu2iiyUuNlnBwrNOAr9bdSNZelMt4TVW6SkOGPPpDit4kSVUD4StHjSpMRUpSPK-z7WG7vHe-HUhtwc_IU5376-dt_X-lmGXmtqUrOXgZVgoGaBi--teDNINzij-8G24Zfa8V55VDNjWYA_TSt5U", customer: "Anonymous", order: "Order #98210", rating: 1, comment: "[Content hidden by moderator due to violation of community guidelines]", date: "1 week ago", status: "Hidden", statusClass: "bg-surface-variant text-on-surface-variant", rowClass: "opacity-60" },
];

export default function AdminReviews() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-primary">Review Moderation</h2>
          <p className="text-on-surface-variant">Manage and respond to customer feedback across all products.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-6 py-2 rounded-lg border-2 border-secondary text-secondary font-button text-button hover:bg-secondary/5 transition-colors">Export Report</button>
          <button className="px-6 py-2 rounded-lg premium-gradient text-white font-button text-button shadow-md active:scale-95 transition-all">Bulk Approve</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-surface-container-lowest p-6 rounded-xl premium-shadow border border-outline-variant/30 flex flex-col justify-between">
          <p className="font-label-caps text-on-surface-variant">TOTAL REVIEWS</p>
          <div className="flex items-end justify-between mt-4"><span className="font-price-lg text-price-lg text-primary">12,482</span><span className="text-green-600 text-sm flex items-center font-bold"><span className="material-symbols-outlined text-sm">trending_up</span> +12%</span></div>
        </div>
        <div className="bg-primary-container p-6 rounded-xl shadow-lg text-white flex flex-col justify-between">
          <p className="font-label-caps text-on-primary-container">PENDING APPROVAL</p>
          <div className="flex items-end justify-between mt-4"><span className="font-price-lg text-price-lg">48</span><span className="bg-secondary px-2 py-1 rounded text-[10px] font-bold tracking-widest uppercase">Action Required</span></div>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl premium-shadow border border-outline-variant/30 flex flex-col justify-between">
          <p className="font-label-caps text-on-surface-variant">AVERAGE RATING</p>
          <div className="flex items-center gap-2 mt-4"><span className="font-price-lg text-price-lg text-primary">4.8</span><Stars n={5} /></div>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl premium-shadow border border-outline-variant/30 flex flex-col justify-between">
          <p className="font-label-caps text-on-surface-variant">REPORTED REVIEWS</p>
          <div className="flex items-end justify-between mt-4"><span className="font-price-lg text-price-lg text-error">7</span><span className="material-symbols-outlined text-error">report_problem</span></div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-surface-container-low p-4 rounded-xl space-y-4 border border-outline-variant/30">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          <div className="flex-1 relative group w-full">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <input className="w-full bg-white border border-outline-variant rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-secondary-container outline-none transition-all font-body-md" placeholder="Search by comments or customer names..." type="text" />
          </div>
          <select className="bg-white border border-outline-variant rounded-lg px-4 py-2 font-body-md focus:ring-2 focus:ring-secondary-container outline-none lg:min-w-[200px] w-full lg:w-auto"><option>All Products</option><option>Premium Business Cards</option><option>Matte Brochures</option></select>
          <select className="bg-white border border-outline-variant rounded-lg px-4 py-2 font-body-md focus:ring-2 focus:ring-secondary-container outline-none lg:min-w-[150px] w-full lg:w-auto"><option>Rating: All</option><option>5 Stars</option><option>1 Star</option></select>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-outline-variant/20 pt-4">
          <div className="flex gap-1 bg-surface-container rounded-lg p-1">
            <button className="px-6 py-2 rounded-md font-button text-button text-primary bg-white shadow-sm">All</button>
            <button className="px-6 py-2 rounded-md font-button text-button text-on-surface-variant hover:bg-white/50 transition-colors">Published</button>
            <button className="px-6 py-2 rounded-md font-button text-button text-on-surface-variant hover:bg-white/50 transition-colors">Pending <span className="ml-1 bg-secondary text-white text-[10px] px-1.5 py-0.5 rounded-full">48</span></button>
            <button className="px-6 py-2 rounded-md font-button text-button text-on-surface-variant hover:bg-white/50 transition-colors">Hidden</button>
          </div>
          <div className="text-on-surface-variant text-sm">Showing 1-10 of <span className="font-bold text-primary">12,482</span> reviews</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-xl premium-shadow overflow-hidden border border-outline-variant/30">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-high border-b border-outline-variant/50">
              <tr>{["PRODUCT", "CUSTOMER", "RATING", "COMMENT", "DATE", "STATUS", "ACTIONS"].map((h) => (
                <th key={h} className={`px-gutter py-4 font-label-caps text-on-surface-variant ${h === "STATUS" ? "text-center" : ""} ${h === "ACTIONS" ? "text-right" : ""} ${h === "COMMENT" ? "w-1/3" : ""}`}>{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {reviews.map((r) => (
                <tr key={r.order} className={`hover:bg-surface-container-low transition-colors group ${r.rowClass}`}>
                  <td className="px-gutter py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-surface-container rounded-lg overflow-hidden flex-shrink-0 border border-outline-variant/20">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img className="w-full h-full object-cover" alt={r.product} src={r.img} />
                      </div>
                      <span className="font-bold text-primary block max-w-[120px] leading-tight">{r.product}</span>
                    </div>
                  </td>
                  <td className="px-gutter py-5">
                    <div className="flex flex-col">
                      <span className="font-bold text-primary flex items-center gap-1">{r.customer}{r.verified && <span className="material-symbols-outlined text-green-600 text-[16px]" style={fill1}>verified</span>}</span>
                      <span className="text-xs text-on-surface-variant">{r.order}</span>
                    </div>
                  </td>
                  <td className="px-gutter py-5"><Stars n={r.rating} /></td>
                  <td className="px-gutter py-5"><p className="text-on-surface-variant text-sm line-clamp-2 italic">&quot;{r.comment}&quot;</p></td>
                  <td className="px-gutter py-5 text-on-surface-variant text-sm whitespace-nowrap">{r.date}</td>
                  <td className="px-gutter py-5 text-center"><span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${r.statusClass}`}>{r.status}</span></td>
                  <td className="px-gutter py-5">
                    <div className={`flex justify-end gap-2 transition-opacity ${r.pending ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                      <button className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors" title="Approve"><span className="material-symbols-outlined">check_circle</span></button>
                      <button className="p-2 text-primary hover:bg-primary/5 rounded-full transition-colors" title="Reply"><span className="material-symbols-outlined">chat_bubble</span></button>
                      <button className="p-2 text-on-surface-variant hover:bg-surface-variant rounded-full transition-colors" title="Hide"><span className="material-symbols-outlined">visibility_off</span></button>
                      <button className="p-2 text-on-surface-variant hover:bg-surface-variant rounded-full transition-colors" title="More"><span className="material-symbols-outlined">more_vert</span></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
