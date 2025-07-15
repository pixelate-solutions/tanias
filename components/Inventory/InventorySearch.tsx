'use client';

import { Input } from '@/components/ui/input';

interface SearchProps {
  value: string;
  onChange: (v: string) => void;
}

export default function InventorySearch({ value, onChange }: SearchProps) {
  return (
    <div className="mb-4">
      <Input
        placeholder="Search inventory…"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="max-w-sm"
      />
    </div>
  );
}
