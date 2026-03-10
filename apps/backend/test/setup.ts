import { createORPCClient } from '@orpc/client'
import { RPCLink } from '@orpc/client/fetch'
import { RouterClient } from '@orpc/server'
import { vi } from 'vitest'

import { appRouter } from '../src/router'
import { orpcServer } from '../src/server'

import { resetDb } from './utils/reset-db'

// Mock gateway service
vi.mock('../src/api/gateway/gateway.service', () => ({
  createPlan: vi.fn(async (name: string, price: number) => ({
    id: `mock-plan-${Date.now()}`,
    meta: { reason: name, price },
  })),
}))

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
