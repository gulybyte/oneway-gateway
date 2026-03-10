import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

import * as schema from '../../src/drizzle/schema'

const rootPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 1,
})

export const tdb: NodePgDatabase<typeof schema> = drizzle(rootPool, { schema })
