"use client";

import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Globe } from "lucide-react";
import { toast } from "sonner";

export default function Footer() {
  const handleLegalClick = (e: React.MouseEvent) => {
    e.preventDefault();
    toast("This is a dummy legal page.");
  };

  const handleSubscribe = () => {
    toast.success("Subscribed to newsletter!");
  };

  return (
    <footer className="mt-auto bg-card text-muted-foreground pt-16 pb-8 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-8 mb-12">
          
          {/* Brand & Newsletter */}
          <div className="col-span-1 md:col-span-2 space-y-6">
            <div>
              <Link href="/" className="text-2xl font-black tracking-tight text-foreground inline-block">
                E-COMMERCE
              </Link>
              <p className="max-w-sm text-sm leading-relaxed text-muted-foreground mt-4">
                Elevating your lifestyle with premium products, curated collections, and an unmatched shopping experience.
              </p>
            </div>
            
            <div className="space-y-3">
              <h4 className="text-foreground font-semibold">Subscribe to our newsletter</h4>
              <div className="flex gap-2 max-w-sm">
                <Input type="email" placeholder="Enter your email" className="bg-background" />
                <Button onPress={handleSubscribe}>Subscribe</Button>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-foreground font-semibold mb-6">Quick Links</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/#hero" className="hover:text-foreground transition-colors">Home</Link></li>
              <li><Link href="/#featured" className="hover:text-foreground transition-colors">Featured Products</Link></li>
              <li><Link href="/products" className="hover:text-foreground transition-colors">All Products</Link></li>
              <li><Link href="/#contact" className="hover:text-foreground transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Legal & Social */}
          <div>
            <h4 className="text-foreground font-semibold mb-6">Legal</h4>
            <ul className="space-y-3 text-sm mb-8">
              <li><a href="#" onClick={handleLegalClick} className="hover:text-foreground transition-colors">Privacy Policy</a></li>
              <li><a href="#" onClick={handleLegalClick} className="hover:text-foreground transition-colors">Terms of Service</a></li>
              <li><a href="#" onClick={handleLegalClick} className="hover:text-foreground transition-colors">Refund Policy</a></li>
            </ul>

            <h4 className="text-foreground font-semibold mb-4">Follow Us</h4>
            <div className="flex gap-4">
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
                Twitter
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
                Instagram
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
                GitHub
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
                YouTube
              </Link>
            </div>
          </div>

        </div>

        <Separator className="mb-8" />
        
        {/* Bottom Bar: Copyright & Payments */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
          <p>&copy; {new Date().getFullYear()} E-COMMERCE Store. All rights reserved.</p>
          
          <div className="flex items-center gap-2">
            <span className="sr-only">Payment Methods</span>
            <div className="px-3 py-1.5 border border-border rounded-md bg-background text-xs font-semibold text-foreground flex items-center gap-1 select-none">
              Visa
            </div>
            <div className="px-3 py-1.5 border border-border rounded-md bg-background text-xs font-semibold text-foreground flex items-center gap-1 select-none">
              Mastercard
            </div>
            <div className="px-3 py-1.5 border border-border rounded-md bg-background text-xs font-semibold text-foreground flex items-center gap-1 select-none">
              Stripe
            </div>
            <div className="px-3 py-1.5 border border-border rounded-md bg-background text-xs font-semibold text-foreground flex items-center gap-1 select-none">
              PayPal
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
