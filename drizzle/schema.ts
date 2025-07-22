// drizzle/schema.ts

import { pgTable, text, numeric, timestamp } from 'drizzle-orm/pg-core';

// Ingredients table
export const ingredients = pgTable('ingredients', {
  id: text('id').primaryKey(),
  itemId: text('item_id').notNull(),
  name: text('name').notNull(),
  cost: numeric('cost', { precision: 12, scale: 2 }).notNull(),
  location: text('location').notNull(),
  quantity: numeric('quantity', { precision: 12, scale: 2 }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: false })
    .notNull()
    .defaultNow(),
  note: text('note').notNull().default(''),
});

// Supplies table
export const supplies = pgTable('supplies', {
  id: text('id').primaryKey(),
  itemId: text('item_id').notNull(),
  name: text('name').notNull(),
  cost: numeric('cost', { precision: 12, scale: 2 }).notNull(),
  location: text('location').notNull(),
  quantity: numeric('quantity', { precision: 12, scale: 2 }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: false })
    .notNull()
    .defaultNow(),
  note: text('note').notNull().default(''),
});
