import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";

export default function CustomerFooter() {
  return (
    <footer className="bg-primary-container text-on-primary-container/60 py-12 px-gutter mt-20 border-t border-outline-variant/10">
      <div className="max-w-container-max mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-1">
          <div className="mb-4">
            <BrandLogo textClass="text-headline-md font-black" iconSize={28} />
          </div>
          <p className="text-sm leading-relaxed">
            Precision printing for modern businesses. Quality you can feel, reliability you can trust.
          </p>
        </div>
        <div>
          <h5 className="text-white font-bold text-sm mb-4">Quick Links</h5>
          <ul className="space-y-2 text-sm">
            <li><Link className="hover:text-white transition-colors" href="/dashboard">Dashboard</Link></li>
            <li><Link className="hover:text-white transition-colors" href="/products">Product Catalog</Link></li>
            <li><Link className="hover:text-white transition-colors" href="/orders">My Orders</Link></li>
            <li><Link className="hover:text-white transition-colors" href="/wallet">Wallet</Link></li>
          </ul>
        </div>
        <div>
          <h5 className="text-white font-bold text-sm mb-4">Support</h5>
          <ul className="space-y-2 text-sm">
            <li><a className="hover:text-white transition-colors" href="#">Contact Us</a></li>
            <li><a className="hover:text-white transition-colors" href="#">FAQs</a></li>
            <li><a className="hover:text-white transition-colors" href="#">Order Status</a></li>
            <li><a className="hover:text-white transition-colors" href="#">Returns &amp; Refunds</a></li>
          </ul>
        </div>
        <div>
          <h5 className="text-white font-bold text-sm mb-4">Newsletter</h5>
          <p className="text-xs mb-4">Stay updated with the latest from Bhagini Graphics.</p>
          <div className="flex gap-2">
            <input className="bg-white/5 border-white/10 rounded px-3 py-2 text-xs flex-1 focus:ring-1 focus:ring-secondary outline-none" placeholder="Email" type="email" />
            <button className="bg-secondary text-white px-4 py-2 rounded text-xs font-bold">Join</button>
          </div>
        </div>
      </div>
      <div className="max-w-container-max mx-auto mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-bold uppercase tracking-widest">
        <p>© 2024 Bhagini Graphics</p>
        <div className="flex gap-6">
          <a className="hover:text-white transition-colors" href="#">Privacy Policy</a>
          <a className="hover:text-white transition-colors" href="#">Terms of Service</a>
          <a className="hover:text-white transition-colors" href="#">Cookie Settings</a>
        </div>
      </div>
    </footer>
  );
}
