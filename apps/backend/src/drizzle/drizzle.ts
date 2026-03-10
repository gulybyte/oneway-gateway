import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { drizzle } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { EnhancedQueryLogger } from 'drizzle-query-logger'
import { Pool } from 'pg'

import * as schema from './schema'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  ssl: process.env.NODE_ENV === 'production',
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
})

export const db = drizzle(pool, {
  schema,
  logger: process.env.DEBUG_ENABLED === 'true' ? new EnhancedQueryLogger() : false,
})

export async function runMigrations() {
  const start = process.hrtime.bigint()

  const baseDir = path.dirname(fileURLToPath(import.meta.url))
  const candidates = [
    path.resolve(baseDir, '../../../../migrations'),
    path.resolve(baseDir, '../../../migrations'),
    path.resolve(baseDir, '../../migrations'),
    path.resolve(baseDir, '../migrations'),
  ]
  const migrationsFolder = candidates.find((p) =>
    fs.existsSync(path.join(p, 'meta', '_journal.json'))
  )
  if (!migrationsFolder)
    throw new Error(`Migrations folder not found. Tried: ${candidates.join(', ')}`)

  await migrate(db, { migrationsFolder: migrationsFolder })

  const end = process.hrtime.bigint()
  const NANOSECONDS_PER_MILLISECOND = 1_000_000
  const DECIMAL_PLACES = 2
  const durationMs = Number(end - start) / NANOSECONDS_PER_MILLISECOND
  console.log(`Migrations completed in ${durationMs.toFixed(DECIMAL_PLACES)}ms`)
}
