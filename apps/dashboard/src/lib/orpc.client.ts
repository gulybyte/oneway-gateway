import { createORPCClient } from '@orpc/client'
import { RPCLink } from '@orpc/client/fetch'

import type { AppClientContract } from '../../../backend/src/contract'

async function readBody(body: ReadableStream<Uint8Array<ArrayBuffer>> | null): Promise<unknown> {
  if (!body) return null
  const clonedBody = body
  const text = await new Response(clonedBody).text()
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

const customFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const request = new Request(input instanceof Request ? input.clone() : input, init)

  const reqBody = await readBody(request.body)
  console.log('🔵 RPC Request:', {
    method: request.method,
    url: request.url,
    headers: Object.fromEntries(request.headers),
    body: reqBody,
  })

  try {
    const response = await fetch(input, {
      ...init,
      credentials: 'include',
    })

    const resClone = response.clone()
    const resBody = await readBody(resClone.body)
    console.log('🟢 RPC Response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers),
      body: resBody,
    })

    return response
  } catch (error) {
    console.error('🔴 RPC Fetch Error:', error)
    throw error
  }
}

const link = new RPCLink({
  url: import.meta.env.VITE_API_URL ?? 'http://localhost:5000',
  fetch: customFetch,
})

export const backend = createORPCClient<AppClientContract>(link)
