import { PostgreSqlContainer } from '@testcontainers/postgresql'

export default async () => {
  const postgres = await new PostgreSqlContainer('postgres:18.3-alpine').withReuse().start()

  process.env.NODE_ENV = 'test'
  process.env.DATABASE_URL = postgres.getConnectionUri()
  process.env.DEBUG_ENABLED = 'false'
  process.env.TZ = 'UTC'

  console.debug = () => {}

  const { runMigrations } = await import('../src/drizzle/drizzle')
  await runMigrations()
}
