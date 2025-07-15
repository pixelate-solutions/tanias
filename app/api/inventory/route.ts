// app/api/inventory/route.ts

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ingredients, supplies } from '@/drizzle/schema';
import { randomUUID } from 'crypto';

interface CreateBody {
  id?: string;
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
      name: supplies.name,
      cost: supplies.cost,
      location: supplies.location,
      quantity: supplies.quantity,
      updatedAt: supplies.updatedAt,
      note: supplies.note,
    })
    .from(supplies);

  const items = [
    ...ing.map(i => ({ ...i, type: 'Ingredient' as const })),
    ...sup.map(s => ({ ...s, type: 'Supply' as const })),
  ];

  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const body = (await request.json()) as CreateBody;

  // Validate required
  if (
    !body.type ||
    !body.name ||
    body.cost == null ||
    !body.location ||
    body.quantity == null
  ) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Use provided id or fallback to randomUUID
  const id = body.id?.trim() || randomUUID();

  let inserted: any;

  if (body.type === 'Ingredient') {
    const result = await db
      .insert(ingredients)
      .values({
        id,
        name: body.name,
        cost: body.cost.toString(),
        location: body.location,
        quantity: body.quantity.toString(),
      })
      .returning();
    inserted = result[0];
  } else {
    const result = await db
      .insert(supplies)
      .values({
        id,
        name: body.name,
        cost: body.cost.toString(),
        location: body.location,
        quantity: body.quantity.toString(),
      })
      .returning();
    inserted = result[0];
  }

  return NextResponse.json({ ...inserted, type: body.type });
}
