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
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4 md:hidden">
          <SidebarTrigger />
        </header>
        <main className="flex-1 w-full max-w-full min-w-0 p-4 sm:p-6 lg:p-8 overflow-x-hidden bg-background transition-colors">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
