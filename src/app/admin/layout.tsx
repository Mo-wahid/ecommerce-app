import AdminSidebar from "@/components/AdminSidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider className="pt-16 min-h-screen">
      <AdminSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger />
        </header>
        <div className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 bg-background transition-colors">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
