'use client';

import React from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { ItemType, InventoryItem } from './types';

interface ModalsProps {
  // create/update
  modalOpen: boolean;
  modalMode: 'create' | 'update';
  newItem: Partial<InventoryItem>;
  createErrors: Record<string,string>;
  delta: string;
  updateError: string;
  onCloseModal: () => void;
  onChangeNew: (k: string, v: string) => void;
  onSubmitCreate: () => void;
  onSubmitUpdate: () => void;

  // delete
  deleteDialogOpen: boolean;
  selectedItem: InventoryItem | null;
  onCloseDelete: () => void;
  onSubmitDelete: () => void;

  // note
  noteDialogOpen: boolean;
  noteMode: 'add' | 'edit';
  noteText: string;
  onCloseNote: () => void;
  onChangeNote: (v: string) => void;
  onSubmitNote: () => void;
}

export default function InventoryModals(props: ModalsProps) {
  const {
    modalOpen, modalMode, newItem, createErrors, delta, updateError,
    onCloseModal, onChangeNew, onSubmitCreate, onSubmitUpdate,
    deleteDialogOpen, selectedItem, onCloseDelete, onSubmitDelete,
    noteDialogOpen, noteMode, noteText, onCloseNote, onChangeNote, onSubmitNote
  } = props;

  return (
    <>
      {/* Create / Adjust */}
      <Dialog open={modalOpen} onOpenChange={o => !o && onCloseModal()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {modalMode === 'create'
                ? 'Create New Item'
                : `Adjust “${selectedItem?.name}”`}
            </DialogTitle>
          </DialogHeader>
          {modalMode === 'create' ? (
            <form onSubmit={e => { e.preventDefault(); onSubmitCreate(); }} className="space-y-4">
              {/* ID */}
              <div>
                <Label className="mb-1 ml-2">ID <span className="text-gray-400">(optional)</span></Label>
                <Input
                  placeholder="Leave blank for auto-generated"
                  value={newItem.id || ''}
                  onChange={e => onChangeNew('id', e.target.value)}
                />
              </div>
              {/* Type */}
              <div>
                <Label className="mb-1 ml-2">Type</Label>
                <Select
                  value={newItem.type || 'Ingredient'}
                  onValueChange={val => onChangeNew('type', val)}
                >
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ingredient">Ingredient</SelectItem>
                    <SelectItem value="Supply">Supply</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Name / Cost / Location / Quantity inputs… */}
              {[
                ['name','Name','text'],
                ['cost','Cost','number'],
                ['location','Location','text'],
                ['quantity','Initial Quantity','number'],
              ].map(([key,label,type]) => (
                <div key={key}>
                  <Label className="mb-1 ml-2">{label}</Label>
                  <Input
                    type={type}
                    step={type==='number' ? '0.01' : undefined}
                    value={(newItem as any)[key] || ''}
                    onChange={e => onChangeNew(key, e.target.value)}
                  />
                  {createErrors[key] && <p className="text-red-500 text-sm mt-1">{createErrors[key]}</p>}
                </div>
              ))}
              <DialogFooter>
                <Button type="submit" className="w-[60%] mx-auto mt-5">Create</Button>
              </DialogFooter>
            </form>
          ) : (
            <form onSubmit={e => { e.preventDefault(); onSubmitUpdate(); }} className="space-y-4">
              <div>
                <Label className="mb-1 ml-2">Quantity (±)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={delta}
                  onChange={e => onChangeNew('delta', e.target.value)}
                />
                {updateError && <p className="text-red-500 text-sm mt-1">{updateError}</p>}
              </div>
              <DialogFooter>
                <Button type="submit">Submit</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <Dialog open={deleteDialogOpen} onOpenChange={o => !o && onCloseDelete()}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <form onSubmit={e => { e.preventDefault(); onSubmitDelete(); }}>
            <p className="p-4">Are you sure you want to delete “{selectedItem?.name}”?</p>
            <DialogFooter className="md:space-x-2">
              <Button type="submit" variant="destructive">Delete</Button>
              <Button type="button" variant="ghost" onClick={onCloseDelete}>Cancel</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Note */}
      <Dialog open={noteDialogOpen} onOpenChange={o => !o && onCloseNote()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {noteMode === 'add' ? 'Add Note' : 'Edit Note'} for “{selectedItem?.name}”
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={e => { e.preventDefault(); onSubmitNote(); }} className="space-y-4">
            <div>
              <Label className="mb-1 ml-2">Note</Label>
              <Textarea rows={6} value={noteText} onChange={e => onChangeNote(e.target.value)} className="w-full"/>
            </div>
            <DialogFooter className="space-x-2">
              <Button type="button" variant="ghost" onClick={onCloseNote}>Cancel</Button>
              <Button type="submit">{noteMode==='add' ? 'Add Note' : 'Save Changes'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
