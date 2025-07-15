// app/inventory/InventoryTable.tsx
'use client';

import React from 'react';
import {
  flexRender,
  Table,                  
} from '@tanstack/react-table';

interface TableProps<T> {
  table: Table<T>;        
  loading: boolean;
  onAdjust: (item: T) => void;
  onDelete: (item: T) => void;
  onAddNote: (item: T) => void;
  onEditNote: (item: T) => void;
}

export default function InventoryTable<T extends { note: string }>(
  props: TableProps<T>
) {
  const { table, loading, onAdjust, onDelete, onAddNote, onEditNote } = props;

  return (
    <div className="overflow-auto rounded-lg border">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-100">
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((header) => {
                const hide = !!(header.column.columnDef.meta as any)?.hideBelowLg;
                return (
                  <th
                    key={header.id}
                    colSpan={header.colSpan}
                    className={`px-4 py-2 text-left text-sm font-semibold ${
                      hide ? 'hidden lg:table-cell' : ''
                    }`}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-gray-200">
          {loading ? (
            <tr>
              <td
                colSpan={table.getAllColumns().length}
                className="py-4 text-center"
              >
                Loading…
              </td>
            </tr>
          ) : table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="odd:bg-white even:bg-gray-50">
                {row.getVisibleCells().map((cell) => {
                  const hide = !!(cell.column.columnDef.meta as any)
                    ?.hideBelowLg;
                  return (
                    <td
                      key={cell.id}
                      className={`px-4 py-2 text-sm ${
                        hide ? 'hidden lg:table-cell' : ''
                      }`}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  );
                })}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={table.getAllColumns().length}
                className="py-4 text-center"
              >
                No items found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
