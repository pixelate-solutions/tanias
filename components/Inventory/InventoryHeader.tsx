'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onNew: () => void;
}

export default function InventoryHeader({ onNew }: HeaderProps) {
  return (
    <div className="flex justify-between items-center mb-6">
      <Link href="/">
        <Button variant="ghost" className="flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </Link>
      <Button onClick={onNew}>+ New Item</Button>
    </div>
  );
}
