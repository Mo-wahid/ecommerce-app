import React from 'react';

interface SelectFilterProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: { label: string; value: string }[];
}

export default function SelectFilter({ options, className = '', ...props }: SelectFilterProps) {
  return (
    <select
      className={`w-full px-4 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-md focus:ring-brand-500 focus:border-brand-500 transition-colors cursor-pointer ${className}`}
      {...props}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
