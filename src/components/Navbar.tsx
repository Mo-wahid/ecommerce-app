"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { ShoppingCart, User, LogOut, Package, Sun, Moon, Loader2 } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useAuthModal } from "@/context/AuthModalContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const user = session?.user;
  const isAuthPage = pathname === "/login" || pathname === "/register";

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
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
    setIsLoggingOut(true);
    await signOut({ redirect: false });
    router.push("/");
    setIsLoggingOut(false);
  };

  if (isAuthPage) {
    return null;
  }

  return (
    <nav className="fixed w-full z-50 top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-black tracking-tight text-primary hover:text-primary/80 transition-colors shrink-0 whitespace-nowrap">
              E-COMMERCE
            </Link>
          </div>

          {pathname === "/" && (
            <div className="hidden lg:flex items-center space-x-8 absolute left-1/2 -translate-x-1/2">
              <Link href="#hero" className={`text-sm font-bold transition-colors ${activeSection === 'hero' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>Home</Link>
              <Link href="#featured" className={`text-sm font-bold transition-colors ${activeSection === 'featured' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>Featured</Link>
              <Link href="#categories" className={`text-sm font-bold transition-colors ${activeSection === 'categories' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>Categories</Link>
              <Link href="#contact" className={`text-sm font-bold transition-colors ${activeSection === 'contact' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>Contact</Link>
            </div>
          )}

          <div className="flex items-center space-x-2 sm:space-x-6 relative z-10">
            {user?.role !== "admin" && pathname !== "/" && (
              <Link href="/products" className="hidden sm:block text-muted-foreground hover:text-primary font-medium text-sm transition-colors">
                Products
              </Link>
            )}

            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="cursor-pointer text-muted-foreground hover:text-primary transition-colors p-2 rounded-full hover:bg-muted flex items-center justify-center"
                aria-label="Toggle Dark Mode"
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            )}

            {status === "loading" ? null : user ? (
              <div className="flex items-center ml-1 sm:ml-4 pl-1 sm:pl-4 border-l border-slate-200 dark:border-slate-700 shrink-0">
                <DropdownMenuTrigger>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 overflow-hidden cursor-pointer">
                    <Avatar className="h-9 w-9 cursor-pointer">
                      <AvatarImage src={user.image || undefined} alt={user.name || "User"} />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">{user.name?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                  </Button>
                  <DropdownMenu placement="bottom end">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1 py-1">
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem href={user.role === "admin" ? "/admin" : "/profile"}>
                      <User className="mr-2 h-4 w-4" />
                      <span>{user.role === "admin" ? "Admin Dashboard" : "Profile"}</span>
                    </DropdownMenuItem>
                    {user.role !== "admin" && (
                      <>
                        <DropdownMenuItem href="/orders">
                          <Package className="mr-2 h-4 w-4" />
                          <span>Orders</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem href="/cart">
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          <span>Cart</span>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onAction={handleLogout}>
                      {isLoggingOut ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4 text-destructive" />}
                      <span className={isLoggingOut ? "" : "text-destructive"}>{isLoggingOut ? "Logging out..." : "Logout"}</span>
                    </DropdownMenuItem>
                  </DropdownMenu>
                </DropdownMenuTrigger>
              </div>
            ) : (
              <div className="flex items-center space-x-2 sm:space-x-4 ml-1 sm:ml-4 pl-1 sm:pl-4 border-l border-slate-200 dark:border-slate-700 shrink-0">
                <Button variant="ghost" onPress={() => openModal("login")} className="text-muted-foreground font-medium cursor-pointer hover:bg-transparent hover:text-primary">
                  Login
                </Button>
                <Button onPress={() => openModal("register")} className="rounded-full shadow-sm cursor-pointer whitespace-nowrap shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground">
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}