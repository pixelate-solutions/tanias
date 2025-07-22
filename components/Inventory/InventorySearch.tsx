'use client';

import { Input } from '@/components/ui/input';

interface SearchProps {
  value: string;
  onChange: (v: string) => void;
}

export default function InventorySearch({ value, onChange }: SearchProps) {
  return (
    <div className="w-[full] lg:w-auto mb-4">
      <Input
        placeholder="Search inventory…"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="lg:w-70 w-[80%] ml-[10%]"
      />
    </div>
  );
}
