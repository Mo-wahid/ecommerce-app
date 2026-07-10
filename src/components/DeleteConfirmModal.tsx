import { Loader2, AlertTriangle, X } from "lucide-react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  itemName: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmModal({
  isOpen,
  itemName,
  isDeleting,
  onConfirm,
  onCancel,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-5 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-500">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="font-bold text-lg">Delete Item</h3>
          </div>
          <button 
            onClick={onCancel}
            disabled={isDeleting}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-slate-700 dark:text-slate-300 mb-2">
            Are you sure you want to delete <span className="font-semibold text-slate-900 dark:text-slate-100">"{itemName}"</span>?
          </p>
          <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-900/50">
            This action cannot be undone. This will permanently remove the item and its data from the server.
          </p>
        </div>
        
        <div className="flex justify-end gap-3 p-5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2 rounded-lg font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium text-white bg-red-600 hover:bg-red-700 transition-colors disabled:bg-red-400 shadow-sm shadow-red-600/20 min-w-[100px]"
          >
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
