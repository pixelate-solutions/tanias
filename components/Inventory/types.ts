export type ItemType = 'Ingredient' | 'Supply';

export interface InventoryItem {
  id: string;
  name: string;
  cost: string;
  location: string;
  quantity: string;
  type: ItemType;
  updatedAt: string;
  note: string;
}
