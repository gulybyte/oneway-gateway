import { createORPCClient } from '@orpc/client'
import { RPCLink } from '@orpc/client/fetch'

import type { AppClientContract } from '../../../backend/src/contract'

const link = new RPCLink({
  url: import.meta.env.VITE_API_URL ?? 'http://localhost:5000',
  fetch: (input, init) =>
    fetch(input, {
      ...init,
      credentials: 'include',
    }),
})

export const backend = createORPCClient<AppClientContract>(link)
