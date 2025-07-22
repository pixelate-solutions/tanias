// InventoryHeader.tsx
'use client';

import React, { useState, DragEvent } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onNew: () => void;
  onUpload: (files: FileList) => Promise<void> | void;
}

export default function InventoryHeader({ onNew, onUpload }: HeaderProps) {
  const [pendingFiles, setPendingFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);

  // called for both drop and file‑picker
  const handleFiles = (files: FileList | null) => {
    if (files && files.length > 0) {
      setPendingFiles(files);
    }
  };

  // drop target
  const handleDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  // submit button
  const handleSubmit = async () => {
    if (!pendingFiles) return;
    setLoading(true);
    try {
      await onUpload(pendingFiles);
      setPendingFiles(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-between items-center mb-6 space-x-4">
      <Link href="/">
        <Button variant="ghost" className="flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </Link>

      <div className="flex space-x-4 items-center">
        {/* hidden file input */}
        <input
          id="bulk-upload"
          type="file"
          accept=".csv"
          className="hidden"
          onChange={e => handleFiles(e.target.files)}
        />

        {!pendingFiles ? (
          // label acts as both click‑to‑open and drop‑zone
          <label
            htmlFor="bulk-upload"
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}
            className="
              flex items-center justify-center
              px-8 py-2 border-2 border-dashed border-gray-300
              rounded-md cursor-pointer text-sm text-gray-600
              hover:bg-gray-50
            "
          >
            Upload File
          </label>
        ) : (
          // once a file is selected
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-600 text-white hover:bg-blue-500"
          >
            {loading ? 'Loading…' : 'Submit Upload'}
          </Button>
        )}

        <Button onClick={onNew}>+ New Item</Button>
      </div>
    </div>
  );
}
