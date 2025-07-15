// lib/db.ts
import { Pool } from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

// Neon requires SSL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

export const db = drizzle(pool, { logger: true })
