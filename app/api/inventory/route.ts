import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ingredients, supplies } from '@/drizzle/schema';
import { randomUUID } from 'crypto';
import { eq } from 'drizzle-orm';

interface CreateBody {
  itemId: string;
  type: 'Ingredient' | 'Supply';
  name: string;
  cost: number;
  location: string;
  quantity: number;
}

export async function GET() {
  const ing = await db
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
    .from(ingredients);

  const sup = await db
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
    .from(supplies);

  return NextResponse.json([
    ...ing.map(i => ({ ...i, type: 'Ingredient' as const })),
    ...sup.map(s => ({ ...s, type: 'Supply' as const })),
  ]);
}

export async function POST(request: Request) {
  const body = (await request.json()) as CreateBody;

  if (
    !body.itemId.trim() ||
    !body.name.trim() ||
    body.cost == null ||
    !body.location.trim() ||
    body.quantity == null
  ) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const id = randomUUID();
  const common = {
    id,
    itemId: body.itemId,
    name: body.name,
    cost: body.cost.toString(),
    location: body.location,
    quantity: body.quantity.toString(),
  };

  let inserted;
  if (body.type === 'Ingredient') {
    [inserted] = await db.insert(ingredients).values(common).returning();
  } else {
    [inserted] = await db.insert(supplies).values(common).returning();
  }

  return NextResponse.json({ ...inserted, type: body.type });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const itemId = searchParams.get('itemId');
  if (!itemId) {
    return NextResponse.json({ error: 'Missing itemId' }, { status: 400 });
  }

  // delete every row sharing that itemId
  await db.delete(ingredients).where(eq(ingredients.itemId, itemId));
  await db.delete(supplies).where(eq(supplies.itemId, itemId));

  return NextResponse.json({ success: true });
}
