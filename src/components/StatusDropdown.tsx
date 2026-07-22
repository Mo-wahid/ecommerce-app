import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface StatusDropdownProps {
  currentStatus: string;
  onStatusChange: (newStatus: string) => void;
}

const STATUSES = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

export default function StatusDropdown({ currentStatus, onStatusChange }: StatusDropdownProps) {
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
    <Select
      aria-label="Order status"
      selectedKey={currentStatus}
      onSelectionChange={(key) => {
        if (key) {
          const newStatus = key.toString();
          onStatusChange(newStatus);
        }
      }}
    >
      <SelectTrigger className={`w-36 font-semibold border ${getStatusClasses(currentStatus)}`}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUSES.map((status) => (
          <SelectItem key={status} id={status} textValue={status}>
            {status}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
