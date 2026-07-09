import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface StatusDropdownProps {
  currentStatus: string;
  onStatusChange: (newStatus: string) => void;
}

const STATUSES = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

export default function StatusDropdown({ currentStatus, onStatusChange }: StatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getStatusClasses = (status: string) => {
    switch (status) {
      case "Pending": return "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800/50";
      case "Processing": return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/50";
      case "Shipped": return "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800/50";
      case "Delivered": return "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/50";
      case "Cancelled": return "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/50";
      default: return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700";
    }
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center justify-between w-36 px-4 py-2 rounded-lg text-sm font-semibold border shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 cursor-pointer ${getStatusClasses(currentStatus)}`}
      >
        <span>{currentStatus}</span>
        <ChevronDown className={`w-4 h-4 ml-2 opacity-70 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute z-20 w-full mt-2 origin-top-right bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          <div className="py-1">
            {STATUSES.map((status) => (
              <button
                key={status}
                onClick={() => {
                  onStatusChange(status);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer
                  ${status === currentStatus ? "bg-slate-50 dark:bg-slate-700/30 text-brand-600 dark:text-brand-400" : "text-slate-700 dark:text-slate-300"}
                `}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
