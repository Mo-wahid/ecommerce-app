import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-auto bg-slate-950 text-slate-400 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-2">
          <Link href="/" className="text-2xl font-black tracking-tight text-brand-500 mb-4 inline-block">
            E-COMMERCE
          </Link>
          <p className="max-w-sm mt-4 text-sm leading-relaxed">
            Elevating your lifestyle with premium products, curated collections, and an unmatched shopping experience.
          </p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/#hero" className="hover:text-brand-400 transition-colors">Home</Link></li>
            <li><Link href="/#featured" className="hover:text-brand-400 transition-colors">Featured Products</Link></li>
            <li><Link href="/products" className="hover:text-brand-400 transition-colors">All Products</Link></li>
            <li><Link href="/#contact" className="hover:text-brand-400 transition-colors">Contact Us</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Legal</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="#" className="hover:text-brand-400 transition-colors">Privacy Policy</Link></li>
            <li><Link href="#" className="hover:text-brand-400 transition-colors">Terms of Service</Link></li>
            <li><Link href="#" className="hover:text-brand-400 transition-colors">Refund Policy</Link></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-slate-800 text-sm text-center">
        <p>&copy; {new Date().getFullYear()} E-COMMERCE Store. All rights reserved.</p>
      </div>
    </footer>
  );
}
