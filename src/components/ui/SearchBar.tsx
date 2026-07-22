import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SearchBarProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export default function SearchBar({ className = '', ...props }: SearchBarProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
        <Search className="w-5 h-5" />
      </div>
      <Input
        type="search"
        className="pl-10 h-11 rounded-xl w-full"
        {...props}
      />
    </div>
  );
}
