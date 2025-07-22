import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ingredients, supplies } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';

interface PatchBody {
  delta?: number;
  cost?: number;
  note?: string;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = (await request.json()) as PatchBody;

  // fetch original entry
  let orig, table: typeof ingredients | typeof supplies, type: 'Ingredient' | 'Supply';
  const ingRows = await db
    .select({
      id: ingredients.id,
      itemId: ingredients.itemId,
      name: ingredients.name,
      cost: ingredients.cost,
      location: ingredients.location,
      quantity: ingredients.quantity,
      updatedAt: ingredients.updatedAt,
      note: ingredients.note,
    })
    .from(ingredients)
    .where(eq(ingredients.id, id));

  if (ingRows.length) {
    orig = ingRows[0];
    table = ingredients;
    type = 'Ingredient';
  } else {
    const supRows = await db
      .select({
        id: supplies.id,
        itemId: supplies.itemId,
        name: supplies.name,
        cost: supplies.cost,
        location: supplies.location,
        quantity: supplies.quantity,
        updatedAt: supplies.updatedAt,
        note: supplies.note,
      })
      .from(supplies)
      .where(eq(supplies.id, id));

    if (!supRows.length) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    orig = supRows[0];
    table = supplies;
    type = 'Supply';
  }

  // note‑only: update in place
  if (typeof body.note === 'string') {
    await db.update(table).set({ note: body.note }).where(eq(table.id, id));
    const [updated] = await db.select().from(table).where(eq(table.id, id));
    return NextResponse.json({ ...updated, type });
  }

  // else: create a new row copying everything, modifying delta or cost
  const newId = randomUUID();
  const insertVals = {
    id: newId,
    itemId: orig.itemId,
    name: orig.name,
    cost:
      typeof body.cost === 'number'
        ? body.cost.toString()
        : orig.cost,
    location: orig.location,
    quantity:
      typeof body.delta === 'number'
        ? body.delta.toString()
        : orig.quantity,

    note: orig.note,
  };

  await db.insert(table).values(insertVals);
  const [inserted] = await db.select().from(table).where(eq(table.id, newId));
  return NextResponse.json({ ...inserted, type });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await db.delete(ingredients).where(eq(ingredients.id, id));
  await db.delete(supplies).where(eq(supplies.id, id));
  return NextResponse.json({ success: true });
}
