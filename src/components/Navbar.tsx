"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { ShoppingCart, User, LogOut, Package, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useAuthModal } from "@/context/AuthModalContext";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const user = session?.user;
  const isAuthPage = pathname === "/login" || pathname === "/register";

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const { openModal } = useAuthModal();

  useEffect(() => {
    setMounted(true);
    
    if (pathname !== "/") return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-50% 0px -50% 0px" }
    );

    const sections = document.querySelectorAll("section[id]");
    sections.forEach((s) => observer.observe(s));

    return () => sections.forEach((s) => observer.unobserve(s));
  }, [pathname]);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  if (isAuthPage) {
    return null;
  }

  return (
    <nav className="fixed w-full z-50 top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-black tracking-tight text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors shrink-0 whitespace-nowrap">
              E-COMMERCE
            </Link>
          </div>

          {pathname === "/" && (
            <div className="hidden lg:flex items-center space-x-8 absolute left-1/2 -translate-x-1/2">
              <Link href="#hero" className={`text-sm font-bold transition-colors ${activeSection === 'hero' ? 'text-brand-600 dark:text-brand-400' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'}`}>Home</Link>
              <Link href="#featured" className={`text-sm font-bold transition-colors ${activeSection === 'featured' ? 'text-brand-600 dark:text-brand-400' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'}`}>Featured</Link>
              <Link href="#categories" className={`text-sm font-bold transition-colors ${activeSection === 'categories' ? 'text-brand-600 dark:text-brand-400' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'}`}>Categories</Link>
              <Link href="#contact" className={`text-sm font-bold transition-colors ${activeSection === 'contact' ? 'text-brand-600 dark:text-brand-400' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'}`}>Contact</Link>
            </div>
          )}

          <div className="flex items-center space-x-2 sm:space-x-6 relative z-10">
            {user?.role !== "admin" && (
              <>
                <Link href="/products" className="hidden sm:block text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 font-medium text-sm transition-colors">
                  Products
                </Link>
                {pathname !== "/" && user && (
                  <>
                    <Link href="/orders" className="text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 font-medium text-sm transition-colors flex items-center gap-1" aria-label="Orders">
                      <Package className="w-5 h-5 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Orders</span>
                    </Link>
                    <Link href="/cart" className="text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 font-medium text-sm transition-colors flex items-center gap-1" aria-label="Cart">
                      <ShoppingCart className="w-5 h-5 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Cart</span>
                    </Link>
                  </>
                )}
              </>
            )}

            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="cursor-pointer text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400 transition-colors p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center"
                aria-label="Toggle Dark Mode"
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            )}

            {status === "loading" ? null : user ? (
              <div className="flex items-center space-x-2 sm:space-x-4 ml-1 sm:ml-4 pl-1 sm:pl-4 border-l border-slate-200 dark:border-slate-700 shrink-0">
                <Link href={user.role === "admin" ? "/admin" : "/profile"} className="text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 font-medium text-sm transition-colors flex items-center gap-1 mr-1 sm:mr-2 shrink-0">
                  <User className="w-5 h-5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">{user.role === "admin" ? "Admin" : user?.name || "Account"}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="cursor-pointer text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors flex items-center gap-1 text-sm font-medium"
                  aria-label="Logout"
                >
                  <LogOut className="w-5 h-5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 sm:space-x-4 ml-1 sm:ml-4 pl-1 sm:pl-4 border-l border-slate-200 dark:border-slate-700 shrink-0">
                <button onClick={() => openModal("login")} className="cursor-pointer text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 font-medium text-sm transition-colors">
                  Login
                </button>
                <button onClick={() => openModal("register")} className="cursor-pointer bg-brand-600 hover:bg-brand-700 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors shadow-sm whitespace-nowrap shrink-0">
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}