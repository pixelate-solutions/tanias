// app/api/inventory/[id]/route.ts

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ingredients, supplies } from '@/drizzle/schema'
import { eq, sql } from 'drizzle-orm'

interface PatchBody {
  delta?: number
  note?: string
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = (await request.json()) as PatchBody

  // 1) Adjust quantity if delta provided
  if (typeof body.delta === 'number') {
    // ingredients
    await db
      .update(ingredients)
      .set({
        quantity: sql`${ingredients.quantity} + ${body.delta}`,
        updatedAt: sql`NOW()`,         // ← bump timestamp
      })
      .where(eq(ingredients.id, id))

    // supplies
    await db
      .update(supplies)
      .set({
        quantity: sql`${supplies.quantity} + ${body.delta}`,
        updatedAt: sql`NOW()`,         // ← bump timestamp
      })
      .where(eq(supplies.id, id))
  }

  // 2) Update note if provided
  if (typeof body.note === 'string') {
    // ingredients
    await db
      .update(ingredients)
      .set({
        note: body.note,
        updatedAt: sql`NOW()`,         // ← bump timestamp
      })
      .where(eq(ingredients.id, id))

    // supplies
    await db
      .update(supplies)
      .set({
        note: body.note,
        updatedAt: sql`NOW()`,         // ← bump timestamp
      })
      .where(eq(supplies.id, id))
  }

  // 3) Return the updated row
  const [ing] = await db
    .select({
      id: ingredients.id,
      name: ingredients.name,
      cost: ingredients.cost,
      location: ingredients.location,
      quantity: ingredients.quantity,
      updatedAt: ingredients.updatedAt,
      note: ingredients.note,
    })
    .from(ingredients)
    .where(eq(ingredients.id, id))

  if (ing) {
    return NextResponse.json({ ...ing, type: 'Ingredient' as const })
  }

  const [sup] = await db
    .select({
      id: supplies.id,
      name: supplies.name,
      cost: supplies.cost,
      location: supplies.location,
      quantity: supplies.quantity,
      updatedAt: supplies.updatedAt,
      note: supplies.note,
    })
    .from(supplies)
    .where(eq(supplies.id, id))

  if (sup) {
    return NextResponse.json({ ...sup, type: 'Supply' as const })
  }

  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  await db.delete(ingredients).where(eq(ingredients.id, id))
  await db.delete(supplies).where(eq(supplies.id, id))

  return NextResponse.json({ success: true })
}
