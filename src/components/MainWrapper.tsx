"use client";

import { usePathname } from "next/navigation";

export default function MainWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // The landing page, admin, profile, and products handle their own full-width layout and padding
  if (pathname === "/" || pathname.startsWith("/admin") || pathname.startsWith("/profile") || pathname.startsWith("/products")) {
    return <main className="flex-grow w-full min-w-0">{children}</main>;
  }

  // All other pages get the standard constrained container
  return (
    <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 w-full min-w-0">
      {children}
    </main>
  );
}
