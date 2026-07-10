export default function CategoriesPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center pb-2">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Categories</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">Manage your store's categories.</p>
        </div>
        <button className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-md font-medium transition-colors shadow-sm">
          Add Category
        </button>
      </div>
      <div className="bg-white dark:bg-slate-800 p-12 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 text-center text-gray-500 dark:text-slate-400">
        Categories management interface coming soon.
      </div>
    </div>
  );
}
