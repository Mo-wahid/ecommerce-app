import AdminSidebar from "@/components/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] pt-16 bg-slate-50 dark:bg-slate-950 transition-colors">
      <AdminSidebar />
      <main className="flex-1 p-6 sm:p-8 lg:p-12 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
