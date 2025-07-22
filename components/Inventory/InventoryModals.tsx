'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { InventoryItem } from './types';

interface ModalsProps {
  // create vs adjust‐quantity
  modalOpen: boolean;
  modalMode: 'create' | 'update';
  newItem: Partial<InventoryItem>;
  createErrors: Record<string,string>;
  delta: string;
  updateError: string;
  onCloseModal: () => void;
  onChangeNew: (key: string, value: string) => void;
  onSubmitCreate: () => void;
  onSubmitUpdate: () => void;

  // delete
  deleteDialogOpen: boolean;
  selectedItem: InventoryItem | null;
  onCloseDelete: () => void;
  onSubmitDelete: () => void;

  // notes
  noteDialogOpen: boolean;
  noteMode: 'add' | 'edit';
  noteText: string;
  onCloseNote: () => void;
  onChangeNote: (v: string) => void;
  onSubmitNote: () => void;
}

export default function InventoryModals(props: ModalsProps) {
  const {
    modalOpen,
    modalMode,
    newItem,
    createErrors,
    delta,
    updateError,
    onCloseModal,
    onChangeNew,
    onSubmitCreate,
    onSubmitUpdate,

    deleteDialogOpen,
    selectedItem,
    onCloseDelete,
    onSubmitDelete,

    noteDialogOpen,
    noteMode,
    noteText,
    onCloseNote,
    onChangeNote,
    onSubmitNote,
  } = props;

  return (
    <>
      {/* Create or Adjust Quantity */}
      <Dialog open={modalOpen} onOpenChange={open => !open && onCloseModal()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {modalMode === 'create'
                ? 'Create New Item'
                : `Adjust “${selectedItem?.name}”`}
            </DialogTitle>
          </DialogHeader>

          {modalMode === 'create' ? (
            <form
              onSubmit={e => {
                e.preventDefault();
                onSubmitCreate();
              }}
              className="space-y-4"
            >
              {/* Item ID */}
              <div>
                <Label>Item ID</Label>
                <Input
                  placeholder="e.g. 101054"
                  value={newItem.itemId || ''}
                  onChange={e => onChangeNew('itemId', e.target.value)}
                />
                {createErrors.itemId && (
                  <p className="text-red-500 text-sm">{createErrors.itemId}</p>
                )}
              </div>

              {/* Type */}
              <div>
                <Label>Type</Label>
                <Select
                  value={newItem.type || 'Ingredient'}
                  onValueChange={val => onChangeNew('type', val)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ingredient">Ingredient</SelectItem>
                    <SelectItem value="Supply">Supply</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Name, Cost, Location, Quantity */}
              {[
                ['name', 'Name', 'text'],
                ['cost', 'Cost', 'number'],
                ['location', 'Location', 'text'],
                ['quantity', 'Quantity', 'number'],
              ].map(([key, label, type]) => (
                <div key={key}>
                  <Label>{label}</Label>
                  <Input
                    type={type as 'text' | 'number'}
                    step={type === 'number' ? '0.01' : undefined}
                    value={(newItem as any)[key] || ''}
                    onChange={e => onChangeNew(key, e.target.value)}
                  />
                  {(createErrors as any)[key] && (
                    <p className="text-red-500 text-sm">{(createErrors as any)[key]}</p>
                  )}
                </div>
              ))}

              <DialogFooter>
                <Button type="submit" className="w-full">
                  Create
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <form
              onSubmit={e => {
                e.preventDefault();
                onSubmitUpdate();
              }}
              className="space-y-4"
            >
              <div>
                <Label>Add/Subtract Quantity (±)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={delta}
                  onChange={e => onChangeNew('delta', e.target.value)}
                />
                {updateError && (
                  <p className="text-red-500 text-sm">{updateError}</p>
                )}
              </div>
              <DialogFooter>
                <Button type="submit">Submit</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog
        open={deleteDialogOpen}
        onOpenChange={open => !open && onCloseDelete()}
      >
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={e => {
              e.preventDefault();
              onSubmitDelete();
            }}
          >
            <p className="p-4">
              Are you sure you want to delete “{selectedItem?.name}”?
            </p>
            <DialogFooter className="space-x-2">
              <Button type="button" className='border' variant="ghost" onClick={onCloseDelete}>
                Cancel
              </Button>
              <Button type="submit" variant="destructive">
                Delete
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Note */}
      <Dialog
        open={noteDialogOpen}
        onOpenChange={open => !open && onCloseNote()}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {noteMode === 'add' ? 'Add Note' : 'Edit Note'} for “
              {selectedItem?.name}”
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={e => {
              e.preventDefault();
              onSubmitNote();
            }}
            className="space-y-4"
          >
            <div>
              <Label>Note</Label>
              <Textarea
                rows={4}
                value={noteText}
                onChange={e => onChangeNote(e.target.value)}
              />
            </div>
            <DialogFooter className="space-x-2">
              <Button variant="ghost" onClick={onCloseNote}>
                Cancel
              </Button>
              <Button type="submit">
                {noteMode === 'add' ? 'Add Note' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
