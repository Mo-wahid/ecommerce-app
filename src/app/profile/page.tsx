export default function ProfilePage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] pt-16 bg-slate-50 dark:bg-slate-950 transition-colors">
      <main className="flex-1 p-6 sm:p-8 lg:p-12">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex justify-between items-center pb-2">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Settings</h1>
              <p className="text-gray-500 dark:text-slate-400 mt-1">Manage your personal profile and preferences.</p>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-12 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 text-center text-gray-500 dark:text-slate-400">
            Profile editing interface coming soon.
          </div>
        </div>
      </main>
    </div>
  );
}
