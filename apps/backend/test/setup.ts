import { createORPCClient } from '@orpc/client'
import { RPCLink } from '@orpc/client/fetch'
import { RouterClient } from '@orpc/server'

import { appRouter } from '../src/router'
import { orpcServer } from '../src/server'

import { resetDb } from './utils/reset-db'

const server = orpcServer().listen()
const address = server.address()

beforeEach(async () => {
  await resetDb()
})

afterAll(() => {
  server.close()
})

export const baseUrl = `http://localhost:${(address as { port: number }).port}`

const link = new RPCLink({ url: baseUrl })

export const client: RouterClient<typeof appRouter> = createORPCClient(link)
