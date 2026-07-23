"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { 
  LayoutDashboard, 
  Package, 
  ListTree, 
  Users, 
  Settings, 
  LogOut,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const links = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "Categories", href: "/admin/categories", icon: ListTree },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <Sidebar collapsible="icon" className="sticky top-16 h-[calc(100vh-4rem)] bg-sidebar border-r border-sidebar-border">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;

                return (
                  <SidebarMenuItem key={link.name}>
                    <SidebarMenuButton
                      href={link.href}
                      isActive={isActive}
                      className={isActive ? "bg-sidebar-accent py-3 text-sidebar-accent-foreground font-semibold" : "text-muted-foreground py-3 font-medium hover:text-foreground"}
                    >
                      <Icon />
                      <span>{link.name}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onPress={() => {
                setIsSigningOut(true);
                signOut({ callbackUrl: '/' });
              }}
              isDisabled={isSigningOut}
              className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive py-3 font-medium transition-colors"
            >
              {isSigningOut ? <Loader2 className="animate-spin" /> : <LogOut />}
              <span>{isSigningOut ? "Logging out..." : "Logout"}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
