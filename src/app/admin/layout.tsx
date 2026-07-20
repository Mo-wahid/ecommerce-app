import AdminSidebar from "@/components/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)] pt-16 bg-slate-50 dark:bg-slate-950 transition-colors w-full">
      <AdminSidebar />
      <main className="flex-1 w-full min-w-0 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
