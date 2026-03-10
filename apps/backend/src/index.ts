import 'dotenv/config'
import { runMigrations } from './drizzle/drizzle'
import { orpcServer } from './server'

const DEFAULT_PORT = process.env.PORT ?? '5000'
const PORT = Number(DEFAULT_PORT)

void (async () => {
  process.env.TZ = 'UTC'

  await runMigrations()

  const server = orpcServer()

  server.listen(PORT, '0.0.0.0', () => console.log(`Listening on 0.0.0.0:${PORT}`))
})()
