import type { Config } from 'drizzle-kit'
import * as dotenv from 'dotenv'
import { z } from 'zod'

// Load environment variables
dotenv.config()

// Define env schema
const envSchema = z.object({
  POSTGRES_USER: z.string(),
  POSTGRES_PASSWORD: z.string(),
  POSTGRES_DB: z.string(),
})

// Parse environment variables
const env = envSchema.parse(process.env)

export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    host: 'localhost',
    port: 5432,
    user: env.POSTGRES_USER,
    password: env.POSTGRES_PASSWORD,
    database: env.POSTGRES_DB,
    ssl: false,
  },
} satisfies Config
