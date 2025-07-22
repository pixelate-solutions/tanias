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

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  ChevronUp,
  ChevronDown,
  MoreHorizontal,
  Calendar as CalendarIcon,
} from 'lucide-react';

import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { endOfDay, format } from 'date-fns';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

import '@/app/globals.css';

export default function InventoryPage() {
  // --- state hooks ---
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  // separate start/end date filters
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  // modals & forms for create/update/delete/note
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'update'>('create');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const [newItem, setNewItem] = useState<{
    itemId: string;
    type: ItemType;
    name: string;
    cost: string;
    location: string;
    quantity: string;
  }>({
    itemId: '',
    type: 'Ingredient',
    name: '',
    cost: '',
    location: '',
    quantity: '',
  });
  const [createErrors, setCreateErrors] = useState<Record<string, string>>({});

  const [delta, setDelta] = useState('');
  const [updateError, setUpdateError] = useState('');

  const [costDialogOpen, setCostDialogOpen] = useState(false);
  const [cost, setCost] = useState('');
  const [costError, setCostError] = useState('');

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [noteMode, setNoteMode] = useState<'add' | 'edit'>('add');
  const [noteText, setNoteText] = useState('');

  // new: change-name dialog
  const [changeNameDialogOpen, setChangeNameDialogOpen] = useState(false);
  const [changeNameText, setChangeNameText] = useState('');

  // --- load all inventory rows ---
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
    if (!newItem.itemId.trim()) errs.itemId = 'Item ID is required';
    if (!newItem.name.trim()) errs.name = 'Name is required';
    if (!newItem.cost.trim() || isNaN(+newItem.cost)) errs.cost = 'Must be a number';
    if (!newItem.location.trim()) errs.location = 'Location is required';
    if (!newItem.quantity.trim() || isNaN(+newItem.quantity)) errs.quantity = 'Must be a number';
    if (Object.keys(errs).length) {
      setCreateErrors(errs);
      return;
    }
    setCreateErrors({});

    await fetch('/api/inventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        itemId: newItem.itemId,
        type: newItem.type,
        name: newItem.name,
        cost: +newItem.cost,
        location: newItem.location,
        quantity: +newItem.quantity,
      }),
    });

    setModalOpen(false);
    setNewItem({ itemId: '', type: 'Ingredient', name: '', cost: '', location: '', quantity: '' });
    await loadInventory();
  }

  // --- adjust quantity (copy + insert new row) ---
  async function handleUpdateQuantity() {
    setUpdateError('');
    const d = parseFloat(delta);
    if (isNaN(d)) {
      setUpdateError('Enter a valid number');
      return;
    }
    if (!selectedItem) return;

    await fetch(`/api/inventory/${selectedItem.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ delta: d }),
    });

    setDelta('');
    setModalOpen(false);
    setSelectedItem(null);
    await loadInventory();
  }

  // --- adjust cost (copy + insert new row) ---
  async function handleUpdateCost() {
    setCostError('');
    if (!cost.trim() || isNaN(+cost)) {
      setCostError('Enter a valid number');
      return;
    }
    if (!selectedItem) return;

    await fetch(`/api/inventory/${selectedItem.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cost: +cost }),
    });

    setCost('');
    setCostDialogOpen(false);
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

    await fetch(
      `/api/inventory?itemId=${encodeURIComponent(selectedItem.itemId)}`,
      { method: 'DELETE' }
    );

    setDeleteDialogOpen(false);
    setSelectedItem(null);
    await loadInventory();
  }

  // --- change name (creates a new zero‑qty entry) ---
  async function handleChangeNameSubmit() {
    if (!selectedItem) return;

    await fetch('/api/inventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        itemId: selectedItem.itemId,
        type: selectedItem.type,
        name: changeNameText,
        cost: parseFloat(selectedItem.cost),
        location: selectedItem.location,
        quantity: 0,
      }),
    });

    setChangeNameDialogOpen(false);
    setSelectedItem(null);
    await loadInventory();
  }

  // --- unified field updater for newItem & delta ---
  function handleChangeNew(key: string, value: string) {
    if (key === 'delta') {
      setDelta(value);
    } else {
      setNewItem(s => ({ ...s, [key]: value }));
    }
  }

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    const file = files[0];
    const text = await file.text();

    // Split into non‑empty lines
    const lines = text.split(/\r?\n/).filter(l => l.trim() !== '');
    if (lines.length < 2) return; // no header + at least one row

    // Remove BOM if present
    let headerLine = lines.shift()!.replace(/^\uFEFF/, '');
    const cols = headerLine
      .split(/\t|,/)
      .map(c => c.trim().toLowerCase());

    // find each column dynamically
    const idIdx = cols.findIndex(c => c.includes('item id'));
    const nameIdx = cols.findIndex(c => c.includes('ingredient'));
    const costIdx = cols.findIndex(c => c.includes('cost'));
    const qtyIdx = cols.findIndex(c => c.includes('quantity'));
    const locIdx = cols.findIndex(c => c.includes('location'));

    // if any are missing, bail
    if ([idIdx, nameIdx, costIdx, qtyIdx, locIdx].some(i => i < 0)) {
      console.warn('CSV not recognized as 5‑column Ingredient template');
      return;
    }

    // parse & insert each data row
    for (const line of lines) {
      const cells = line.split(/\t|,/).map(c => c.trim());
      if (cells.length < cols.length) continue; // skip incomplete

      const itemId   = cells[idIdx];
      const name     = cells[nameIdx];
      const cost     = parseFloat(cells[costIdx]);
      const quantity = parseFloat(cells[qtyIdx]);
      const location = cells[locIdx];

      await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId,
          type: 'Ingredient' as const,
          name,
          cost,
          location,
          quantity,
        }),
      });
    }

    window.location.reload();
    // await loadInventory();
  }

  // --- aggregate & filter by startDate/endDate ---
  const aggregatedItems = useMemo(() => {
    let filtered = items;
    if (startDate) {
      filtered = filtered.filter(i => new Date(i.updatedAt) >= startDate);
    }
    if (endDate) {
      const inclusiveEnd = endOfDay(endDate);
      filtered = filtered.filter(i => new Date(i.updatedAt) <= inclusiveEnd);
    }

    const map = new Map<string, InventoryItem[]>();
    filtered.forEach(i => {
      if (!map.has(i.itemId)) map.set(i.itemId, []);
      map.get(i.itemId)!.push(i);
    });

    return Array.from(map.values()).map(entries => {
      const latest = entries.reduce((a, b) =>
        new Date(b.updatedAt) > new Date(a.updatedAt) ? b : a
      );
      const sumQty = entries.reduce((sum, e) => sum + parseFloat(e.quantity), 0);

      return {
        ...latest,
        quantity: sumQty.toFixed(2),
        cost: latest.cost,
      };
    });
  }, [items, startDate, endDate]);

  // --- table columns ---
  const columns = useMemo<ColumnDef<InventoryItem>[]>(() => [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting()}
          className="hover:cursor-pointer flex items-center text-sm font-semibold"
        >
          Name
          {column.getIsSorted() === 'asc'
            ? <ChevronUp className="ml-1 w-4 h-4" />
            : column.getIsSorted() === 'desc'
            ? <ChevronDown className="ml-1 w-4 h-4" />
            : null}
        </button>
      ),
      cell: info => info.getValue<string>(),
    },
    {
      accessorKey: 'type',
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting()}
          className="hover:cursor-pointer flex items-center text-sm font-semibold"
        >
          Type
          {column.getIsSorted() === 'asc'
            ? <ChevronUp className="ml-1 w-4 h-4" />
            : column.getIsSorted() === 'desc'
            ? <ChevronDown className="ml-1 w-4 h-4" />
            : null}
        </button>
      ),
      cell: info => info.getValue<ItemType>(),
      meta: { hideBelowLg: true },
    },
    {
      accessorKey: 'cost',
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting()}
          className="hover:cursor-pointer flex items-center text-sm font-semibold"
        >
          Cost
          {column.getIsSorted() === 'asc'
            ? <ChevronUp className="ml-1 w-4 h-4" />
            : column.getIsSorted() === 'desc'
            ? <ChevronDown className="ml-1 w-4 h-4" />
            : null}
        </button>
      ),
      cell: info => `$${parseFloat(info.getValue<string>()).toFixed(2)}`,
    },
    {
      accessorKey: 'location',
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting()}
          className="hover:cursor-pointer flex items-center text-sm font-semibold"
        >
          Location
          {column.getIsSorted() === 'asc'
            ? <ChevronUp className="ml-1 w-4 h-4" />
            : column.getIsSorted() === 'desc'
            ? <ChevronDown className="ml-1 w-4 h-4" />
            : null}
        </button>
      ),
      cell: info => info.getValue<string>(),
      meta: { hideBelowLg: true },
    },
    {
      accessorKey: 'quantity',
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting()}
          className="hover:cursor-pointer flex items-center text-sm font-semibold"
        >
          Quantity
          {column.getIsSorted() === 'asc'
            ? <ChevronUp className="ml-1 w-4 h-4" />
            : column.getIsSorted() === 'desc'
            ? <ChevronDown className="ml-1 w-4 h-4" />
            : null}
        </button>
      ),
      cell: info => parseFloat(info.getValue<string>()).toFixed(2),
    },
    {
      accessorKey: 'updatedAt',
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting()}
          className="hover:cursor-pointer flex items-center text-sm font-semibold"
        >
          Last Updated
          {column.getIsSorted() === 'asc'
            ? <ChevronUp className="ml-1 w-4 h-4" />
            : column.getIsSorted() === 'desc'
            ? <ChevronDown className="ml-1 w-4 h-4" />
            : null}
        </button>
      ),
      cell: info =>
        new Date(info.getValue<string>()).toLocaleString(undefined, {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        }).replace(',', ' @'),
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
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => {
                setSelectedItem(item);
                setChangeNameText(item.name);
                setChangeNameDialogOpen(true);
              }}>Change Name</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => {
                setSelectedItem(item);
                setModalMode('update');
                setDelta('');
                setUpdateError('');
                setModalOpen(true);
              }}>Adjust Quantity</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => {
                setCostDialogOpen(true);
                setSelectedItem(item);
                setCost(item.cost);
                setCostError('');
              }}>Adjust Cost</DropdownMenuItem>
              {item.note
                ? <DropdownMenuItem onSelect={() => {
                    setNoteMode('edit');
                    setSelectedItem(item);
                    setNoteText(item.note);
                    setNoteDialogOpen(true);
                  }}>Edit Note</DropdownMenuItem>
                : <DropdownMenuItem onSelect={() => {
                    setNoteMode('add');
                    setSelectedItem(item);
                    setNoteText('');
                    setNoteDialogOpen(true);
                  }}>Add Note</DropdownMenuItem>
              }
              <DropdownMenuItem variant="destructive" onSelect={() => {
                setSelectedItem(item);
                setDeleteDialogOpen(true);
              }}>Remove Item</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ], []);

  // build the table
  const table = useReactTable({
    data: aggregatedItems,
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
        onUpload={handleUpload}
        onNew={() => {
          setModalMode('create');
          setSelectedItem(null);
          setCreateErrors({});
          setModalOpen(true);
        }}
      />

      {/* Search + Date filters */}
      <div className="lg:flex space-x-2 lg:space-x-4 mb-4 w-full justify-center lg:justify-evenly">
        <InventorySearch
          value={globalFilter}
          onChange={setGlobalFilter}
        />

        <div className='lg:flex space-y-4 lg:space-x-4 mt-2 lg:mt-0 w-full justify-center'>
          {/* Start Date Picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="lg:w-60 w-[80%] ml-[10%] lg:ml-0 justify-start text-left">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate
                  ? `Start: ${format(startDate, 'MMM dd, yyyy')}`
                  : 'Start date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={date => setStartDate(date || undefined)}
                captionLayout="dropdown"
                initialFocus
              />
            </PopoverContent>
          </Popover>

          {/* End Date Picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="lg:w-60 w-[80%] ml-[10%] lg:ml-0 justify-start text-left">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate
                  ? `End: ${format(endDate, 'MMM dd, yyyy')}`
                  : 'End date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={date => setEndDate(date || undefined)}
                captionLayout="dropdown"
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <InventoryTable
        table={table}
        loading={loading}
        onAdjust={() => {}}
        onDelete={() => {}}
        onAddNote={() => {}}
        onEditNote={() => {}}
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
        onSubmitUpdate={handleUpdateQuantity}
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

      {/* Change Name Dialog */}
      <Dialog open={changeNameDialogOpen} onOpenChange={open => !open && setChangeNameDialogOpen(false)}>  
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Change Name</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={e => {
              e.preventDefault();
              handleChangeNameSubmit();
            }}
            className="space-y-4"
          >
            <div>
              <Label>New Name</Label>
              <Input
                value={changeNameText}
                onChange={e => setChangeNameText(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Adjust Cost Dialog */}
      <Dialog open={costDialogOpen} onOpenChange={open => !open && setCostDialogOpen(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adjust Cost</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={e => {
              e.preventDefault();
              handleUpdateCost();
            }}
            className="space-y-4"
          >
            <div>
              <Label>New Cost</Label>
              <Input
                type="number"
                step="0.01"
                value={cost}
                onChange={e => setCost(e.target.value)}
              />
              {costError && <p className="text-red-500 text-sm">{costError}</p>}
            </div>
            <DialogFooter>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
