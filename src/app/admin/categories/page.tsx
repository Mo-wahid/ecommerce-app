"use client";

import { Edit, Trash2, Plus, Image as ImageIcon } from "lucide-react";

const DUMMY_CATEGORIES = [
  { id: 1, name: "Electronics", items: 124, image: "/images/cat_electronics.png" },
  { id: 2, name: "Clothing", items: 85, image: "/images/cat_clothing.png" },
  { id: 3, name: "Books", items: 320, image: "/images/cat_books.png" },
  { id: 4, name: "Home & Garden", items: 64, image: "/images/cat_home.png" },
  { id: 5, name: "Toys", items: 42, image: "/images/cat_toys.png" },
  { id: 6, name: "Sports & Outdoors", items: 91, image: "/images/cat_sports.png" },
  { id: 7, name: "Beauty & Personal Care", items: 110, image: "/images/cat_beauty.png" },
  { id: 8, name: "Automotive", items: 28, image: "/images/cat_auto.png" },
];

export default function CategoriesPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center pb-2">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Categories</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">Manage your store's product categories.</p>
        </div>
        <button className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-md font-medium transition-colors shadow-sm flex items-center gap-2 cursor-pointer">
          <Plus className="w-5 h-5" />
          Add Category
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-900/50 border-b border-gray-200 dark:border-slate-700">
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-slate-300">Category Name</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-slate-300">Image</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-slate-300">Total Products</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-slate-300 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {DUMMY_CATEGORIES.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50 dark:hover:bg-slate-750 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-semibold text-gray-900 dark:text-slate-100">{category.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
                      <ImageIcon className="w-4 h-4" />
                      <span className="truncate max-w-[150px]" title={category.image}>{category.image}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-600">
                      {category.items} items
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <button className="text-brand-600 dark:text-brand-400 hover:text-brand-800 dark:hover:text-brand-300 transition-colors cursor-pointer inline-flex p-1 rounded-md hover:bg-brand-50 dark:hover:bg-brand-900/30">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors cursor-pointer inline-flex p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/30">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
