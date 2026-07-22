import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";

const PHONE = "+91 72030 00701";
const EMAIL = "bhaginigraphics@gmail.com";

export default function CustomerFooter() {
  return (
    <footer className="bg-primary-container text-white/75 py-12 px-gutter mt-20 border-t border-outline-variant/10">
      <div className="max-w-container-max mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
        <div>
          <div className="mb-4">
            <Link href="/" className="inline-flex" aria-label="Bhagini Graphics — home">
              <BrandLogo textClass="text-headline-md font-black" iconSize={28} />
            </Link>
          </div>
          <p className="text-sm leading-relaxed max-w-xs">
            Online printing for businesses across India — instant pricing, prepaid wallet checkout,
            and order tracking.
          </p>
        </div>
        <div>
          <h5 className="text-white font-bold text-sm mb-4">Quick Links</h5>
          <ul className="space-y-2 text-sm">
            <li><Link className="hover:text-white transition-colors" href="/dashboard">Dashboard</Link></li>
            <li><Link className="hover:text-white transition-colors" href="/products">Products</Link></li>
            <li><Link className="hover:text-white transition-colors" href="/orders">My Orders</Link></li>
            <li><Link className="hover:text-white transition-colors" href="/wallet">Wallet</Link></li>
          </ul>
        </div>
        <div>
          <h5 className="text-white font-bold text-sm mb-4">Contact</h5>
          <ul className="space-y-2 text-sm">
            <li><a className="flex items-center gap-2 hover:text-white transition-colors" href={`tel:${PHONE.replace(/\s/g, "")}`}><span className="material-symbols-outlined text-[18px]" aria-hidden="true">call</span>{PHONE}</a></li>
            <li><a className="flex items-center gap-2 hover:text-white transition-colors" href={`mailto:${EMAIL}`}><span className="material-symbols-outlined text-[18px]" aria-hidden="true">mail</span>{EMAIL}</a></li>
          </ul>
        </div>
      </div>
      <div className="max-w-container-max mx-auto mt-10 pt-8 border-t border-white/5 text-[10px] font-bold uppercase tracking-widest">
        <p>© {new Date().getFullYear()} Bhagini Graphics</p>
      </div>
    </footer>
  );
}
