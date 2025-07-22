'use client';

import React, { useRef, DragEvent } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onNew: () => void;
  onUpload: (files: FileList) => void;
}

export default function InventoryHeader({ onNew, onUpload }: HeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (files && files.length > 0) {
      onUpload(files);
      // reset so same file can be re‑selected if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="flex justify-between items-center mb-6 space-x-4">
      <Link href="/">
        <Button variant="ghost" className="flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </Link>

      <div className="flex space-x-4">
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={handleDrop}
          className="
            relative flex items-center justify-center
            px-8 py-2 border-2 border-dashed border-gray-300
            rounded-md cursor-pointer text-sm text-gray-600
            hover:bg-gray-50 hover:cursor-pointer
          "
        >
          Upload File
          <input
            ref={fileInputRef}
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={e => handleFiles(e.target.files)}
          />
        </div>
        <Button onClick={onNew}>+ New Item</Button>
      </div>
    </div>
  );
}
