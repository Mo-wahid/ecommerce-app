"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { 
  LayoutDashboard, 
  Package, 
  ListTree, 
  Users, 
  Settings, 
  LogOut 
} from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();

  const links = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "Categories", href: "/admin/categories", icon: ListTree },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <aside className="w-full max-w-[100vw] overflow-hidden md:w-64 bg-white dark:bg-slate-900 border-b md:border-b-0 md:border-r border-gray-200 dark:border-slate-800 h-auto md:h-[calc(100vh-4rem)] md:sticky top-16 flex flex-col transition-colors z-40 shrink-0">
      <div className="p-4 md:p-6 flex-none md:flex-1 overflow-x-auto md:overflow-y-auto hide-scrollbar">
        <nav className="flex flex-row md:flex-col gap-2 md:space-y-0 min-w-max md:min-w-0">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-2.5 md:py-3 rounded-xl transition-all font-medium ${
                  isActive
                    ? "bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-brand-600 dark:text-brand-400" : "text-slate-400"}`} />
                <span className="whitespace-nowrap">{link.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 md:p-6 border-t border-gray-200 dark:border-slate-800 hidden md:block">
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all font-medium"
        >
          <LogOut className="w-5 h-5" />
          <span className="hidden md:inline">Logout</span>
        </button>
      </div>
    </aside>
  );
}
