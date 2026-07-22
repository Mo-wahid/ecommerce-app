import React from 'react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

interface SelectFilterProps {
  value?: string;
  onChange?: (value: string) => void;
  options: { label: string; value: string }[];
  className?: string;
}

export default function SelectFilter({ options, value, onChange, className = '' }: SelectFilterProps) {
  return (
    <Select aria-label="Filter options" selectedKey={value} onSelectionChange={(key) => onChange && onChange(key?.toString() || "")}>
      <SelectTrigger className={`w-full h-11 rounded-xl ${className}`}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.value} id={opt.value} textValue={opt.label}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
