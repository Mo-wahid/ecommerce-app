import React from 'react';

interface SearchBarProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export default function SearchBar({ className = '', ...props }: SearchBarProps) {
  return (
    <input
      type="text"
      className={`w-full px-4 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 rounded-md focus:ring-brand-500 focus:border-brand-500 transition-colors ${className}`}
      {...props}
    />
  );
}
