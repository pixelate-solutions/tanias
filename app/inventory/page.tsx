// app/inventory/page.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  ColumnDef,
  SortingState,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table';

import { InventoryItem, ItemType } from '@/components/Inventory/types';
import InventoryHeader from '@/components/Inventory/InventoryHeader';
import InventorySearch from '@/components/Inventory/InventorySearch';
import InventoryTable from '@/components/Inventory/InventoryTable';
import InventoryModals from '@/components/Inventory/InventoryModals';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown, MoreHorizontal } from 'lucide-react';


export default function InventoryPage() {
  // --- state hooks ---
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'update'>('create');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [delta, setDelta] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [noteMode, setNoteMode] = useState<'add' | 'edit'>('add');
  const [noteText, setNoteText] = useState('');

  const [newItem, setNewItem] = useState<{
    id: string;
    type: ItemType;
    name: string;
    cost: string;
    location: string;
    quantity: string;
  }>({
    id: '',
    type: 'Ingredient',
    name: '',
    cost: '',
    location: '',
    quantity: '',
  });
  const [createErrors, setCreateErrors] = useState<{
    name?: string;
    cost?: string;
    location?: string;
    quantity?: string;
  }>({});
  const [updateError, setUpdateError] = useState<string>('');

  // --- data loading ---
  async function loadInventory() {
    setLoading(true);
    try {
      const res = await fetch('/api/inventory');
      const data: InventoryItem[] = await res.json();
      setItems(data);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    loadInventory();
  }, []);

  // --- create new item ---
  async function handleCreate() {
    const errs: typeof createErrors = {};
    if (!newItem.name.trim()) errs.name = 'Name is required';
    if (!newItem.cost.trim() || isNaN(parseFloat(newItem.cost))) errs.cost = 'Must be a number';
    if (!newItem.location.trim()) errs.location = 'Location is required';
    if (!newItem.quantity.trim() || isNaN(parseFloat(newItem.quantity))) errs.quantity = 'Must be a number';
    if (Object.keys(errs).length) {
      setCreateErrors(errs);
      return;
    }
    setCreateErrors({});

    const body: any = {
      type: newItem.type,
      name: newItem.name,
      cost: parseFloat(newItem.cost),
      location: newItem.location,
      quantity: parseFloat(newItem.quantity),
    };
    if (newItem.id.trim()) {
      body.id = newItem.id.trim();
    }

    await fetch('/api/inventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    setModalOpen(false);
    setNewItem({ id: '', type: 'Ingredient', name: '', cost: '', location: '', quantity: '' });
    await loadInventory();
  }

  // --- update quantity ---
  async function handleUpdate() {
    setUpdateError('');
    if (!delta.trim() || isNaN(parseFloat(delta))) {
      setUpdateError('Enter a valid number');
      return;
    }
    if (!selectedItem) return;

    await fetch(`/api/inventory/${selectedItem.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ delta: parseFloat(delta) }),
    });

    setModalOpen(false);
    setDelta('');
    setSelectedItem(null);
    await loadInventory();
  }

  // --- add/edit note ---
  async function handleNoteSubmit() {
    if (!selectedItem) return;

    await fetch(`/api/inventory/${selectedItem.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note: noteText }),
    });

    setNoteDialogOpen(false);
    setSelectedItem(null);
    setNoteText('');
    await loadInventory();
  }

  // --- delete item ---
  async function handleDelete() {
    if (!selectedItem) return;

    await fetch(`/api/inventory/${selectedItem.id}`, {
      method: 'DELETE',
    });

    setDeleteDialogOpen(false);
    setSelectedItem(null);
    await loadInventory();
  }

  // --- unified field updater for newItem & delta ---
  function handleChangeNew(key: string, value: string) {
    if (key === 'delta') {
      setDelta(value);
    } else if (key === 'type') {
      setNewItem(s => ({ ...s, type: value as ItemType }));
    } else {
      setNewItem(s => ({ ...s, [key]: value }));
    }
  }

  // --- table column definitions ---
  const columns = useMemo<ColumnDef<InventoryItem>[]>(
    () => [
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <button onClick={() => column.toggleSorting()} className="hover:cursor-pointer flex items-center text-sm font-semibold">
            Name
            {column.getIsSorted() === 'asc' ? <ChevronUp className="ml-1 w-4 h-4" />
              : column.getIsSorted() === 'desc' ? <ChevronDown className="ml-1 w-4 h-4" />
              : null}
          </button>
        ),
        cell: info => info.getValue<string>(),
      },
      {
        accessorKey: 'type',
        header: ({ column }) => (
          <button onClick={() => column.toggleSorting()} className="hover:cursor-pointer flex items-center text-sm font-semibold">
            Type
            {column.getIsSorted() === 'asc' ? <ChevronUp className="ml-1 w-4 h-4" />
              : column.getIsSorted() === 'desc' ? <ChevronDown className="ml-1 w-4 h-4" />
              : null}
          </button>
        ),
        cell: info => info.getValue<ItemType>(),
        meta: { hideBelowLg: true },
      },
      {
        accessorKey: 'cost',
        header: ({ column }) => (
          <button onClick={() => column.toggleSorting()} className="hover:cursor-pointer flex items-center text-sm font-semibold">
            Cost
            {column.getIsSorted() === 'asc' ? <ChevronUp className="ml-1 w-4 h-4" />
              : column.getIsSorted() === 'desc' ? <ChevronDown className="ml-1 w-4 h-4" />
              : null}
          </button>
        ),
        cell: info => `$${parseFloat(info.getValue<string>()).toFixed(2)}`,
      },
      {
        accessorKey: 'location',
        header: ({ column }) => (
          <button onClick={() => column.toggleSorting()} className="hover:cursor-pointer flex items-center text-sm font-semibold">
            Location
            {column.getIsSorted() === 'asc' ? <ChevronUp className="ml-1 w-4 h-4" />
              : column.getIsSorted() === 'desc' ? <ChevronDown className="ml-1 w-4 h-4" />
              : null}
          </button>
        ),
        cell: info => info.getValue<string>(),
        meta: { hideBelowLg: true },
      },
      {
        accessorKey: 'quantity',
        header: ({ column }) => (
          <button onClick={() => column.toggleSorting()} className="hover:cursor-pointer flex items-center text-sm font-semibold">
            Quantity
            {column.getIsSorted() === 'asc' ? <ChevronUp className="ml-1 w-4 h-4" />
              : column.getIsSorted() === 'desc' ? <ChevronDown className="ml-1 w-4 h-4" />
              : null}
          </button>
        ),
        cell: info => parseFloat(info.getValue<string>()).toFixed(2),
      },
      {
        accessorKey: 'updatedAt',
        header: ({ column }) => (
          <button onClick={() => column.toggleSorting()} className="hover:cursor-pointer flex items-center text-sm font-semibold">
            Last Updated
            {column.getIsSorted() === 'asc' ? <ChevronUp className="ml-1 w-4 h-4" />
              : column.getIsSorted() === 'desc' ? <ChevronDown className="ml-1 w-4 h-4" />
              : null}
          </button>
        ),
        cell: info => new Date(info.getValue<string>()).toLocaleString().replaceAll('/','-').replaceAll(',',' @'),
        meta: { hideBelowLg: true },
      },
      {
        id: 'actions',
        header: () => <span className="text-left text-sm font-semibold">Actions</span>,
        cell: ({ row }) => {
          const item = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm"><MoreHorizontal className="h-4 w-4" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => {
                  setModalMode('update');
                  setSelectedItem(item);
                  setDelta('');
                  setUpdateError('');
                  setModalOpen(true);
                }}>Adjust Quantity</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => {
                  setSelectedItem(item);
                  setDeleteDialogOpen(true);
                }}>Remove Item</DropdownMenuItem>
                {item.note.trim() === '' ? (
                  <DropdownMenuItem onSelect={() => {
                    setNoteMode('add');
                    setSelectedItem(item);
                    setNoteText('');
                    setNoteDialogOpen(true);
                  }}>Add Note</DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onSelect={() => {
                    setNoteMode('edit');
                    setSelectedItem(item);
                    setNoteText(item.note);
                    setNoteDialogOpen(true);
                  }}>Edit Note</DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: items,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="min-h-screen bg-gray-50 px-1 lg:px-20 pt-10">
      <InventoryHeader
        onNew={() => {
          setModalMode('create');
          setSelectedItem(null);
          setCreateErrors({});
          setModalOpen(true);
        }}
      />

      <InventorySearch
        value={globalFilter}
        onChange={setGlobalFilter}
      />

      <InventoryTable
        table={table}
        loading={loading}
        onAdjust={item => {
          setModalMode('update');
          setSelectedItem(item);
          setDelta('');
          setUpdateError('');
          setModalOpen(true);
        }}
        onDelete={item => {
          setSelectedItem(item);
          setDeleteDialogOpen(true);
        }}
        onAddNote={item => {
          setNoteMode('add');
          setSelectedItem(item);
          setNoteText('');
          setNoteDialogOpen(true);
        }}
        onEditNote={item => {
          setNoteMode('edit');
          setSelectedItem(item);
          setNoteText(item.note);
          setNoteDialogOpen(true);
        }}
      />

      <InventoryModals
        modalOpen={modalOpen}
        modalMode={modalMode}
        newItem={newItem}
        createErrors={createErrors}
        delta={delta}
        updateError={updateError}
        onCloseModal={() => setModalOpen(false)}
        onChangeNew={handleChangeNew}
        onSubmitCreate={handleCreate}
        onSubmitUpdate={handleUpdate}
        deleteDialogOpen={deleteDialogOpen}
        selectedItem={selectedItem}
        onCloseDelete={() => setDeleteDialogOpen(false)}
        onSubmitDelete={handleDelete}
        noteDialogOpen={noteDialogOpen}
        noteMode={noteMode}
        noteText={noteText}
        onCloseNote={() => setNoteDialogOpen(false)}
        onChangeNote={setNoteText}
        onSubmitNote={handleNoteSubmit}
      />
    </div>
  );
}
