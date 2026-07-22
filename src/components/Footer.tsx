import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export default function Footer() {
  return (
    <footer className="mt-auto bg-card text-muted-foreground py-12 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-2">
          <Link href="/" className="text-2xl font-black tracking-tight text-foreground mb-4 inline-block">
            E-COMMERCE
          </Link>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            Elevating your lifestyle with premium products, curated collections, and an unmatched shopping experience.
          </p>
        </div>
        <div>
          <h4 className="text-foreground font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/#hero" className="hover:text-foreground transition-colors">Home</Link></li>
            <li><Link href="/#featured" className="hover:text-foreground transition-colors">Featured Products</Link></li>
            <li><Link href="/products" className="hover:text-foreground transition-colors">All Products</Link></li>
            <li><Link href="/#contact" className="hover:text-foreground transition-colors">Contact Us</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-foreground font-semibold mb-4">Legal</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="#" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
            <li><Link href="#" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
            <li><Link href="#" className="hover:text-foreground transition-colors">Refund Policy</Link></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 text-sm text-center">
        <Separator className="mb-8" />
        <p>&copy; {new Date().getFullYear()} E-COMMERCE Store. All rights reserved.</p>
      </div>
    </footer>
  );
}
