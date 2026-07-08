"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // 1. Hide the navbar completely on auth pages
  const isAuthPage = pathname === "/login" || pathname === "/register";

  // 2. Fetch the user from localStorage when the component mounts on the client
  useEffect(() => {
    setIsMounted(true);
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, [pathname]); // Re-run if the route changes to catch fresh logins

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    router.push("/login");
  };

  if (isAuthPage) {
    return null; // Renders nothing on /login and /register
  }

  return (
    <nav className="bg-gray-900 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold tracking-wider">
              E-COMMERCE
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/products" className="hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium">
              Products
            </Link>
            <Link href="/cart" className="hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium">
              Cart
            </Link>

            {/* 3. Conditionally render User Info or Login Button */}
            {isMounted && user ? (
              <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-gray-700">
                <span className="text-sm font-medium text-gray-300">
                  Welcome, <span className="text-white font-bold">{user.name}</span>
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              isMounted && (
                <Link href="/login" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium transition-colors ml-4">
                  Login
                </Link>
              )
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}