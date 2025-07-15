// drizzle.config.ts
import { defineConfig } from 'drizzle-kit'
import dotenv from 'dotenv'

// explicitly load .env.local
dotenv.config({ path: '.env.local' })

export default defineConfig({
  schema: './drizzle/schema.ts',
  out:    './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,  // now defined
  },
})
