"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { ShoppingCart, User, LogOut, Package } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const user = session?.user;
  const isAuthPage = pathname === "/login" || pathname === "/register";

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  if (isAuthPage) {
    return null;
  }

  return (
    <nav className="fixed w-full z-50 top-0 bg-white/80 backdrop-blur-md border-b border-slate-200 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-black tracking-tight text-brand-600 hover:text-brand-700 transition-colors">
              E-COMMERCE
            </Link>
          </div>
          <div className="flex items-center space-x-6">
            <Link href="/products" className="text-slate-600 hover:text-brand-600 font-medium text-sm transition-colors">
              Products
            </Link>
            <Link href="/cart" className="text-slate-600 hover:text-brand-600 font-medium text-sm transition-colors flex items-center gap-1">
              <ShoppingCart className="w-4 h-4" />
              <span>Cart</span>
            </Link>

            {status === "loading" ? null : user ? (
              <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-slate-200">
                <Link href="/orders" className="text-slate-600 hover:text-brand-600 font-medium text-sm transition-colors flex items-center gap-1 mr-2">
                  <Package className="w-4 h-4" />
                  <span>Orders</span>
                </Link>
                <span className="text-sm font-medium text-slate-500 flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-900">{user.name}</span>
                </span>
                <button
                  onClick={handleLogout}
                  className="text-slate-500 hover:text-red-600 transition-colors flex items-center gap-1 text-sm font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-slate-200">
                <Link href="/login" className="text-slate-600 hover:text-brand-600 font-medium text-sm transition-colors">
                  Login
                </Link>
                <Link href="/register" className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors shadow-sm">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}