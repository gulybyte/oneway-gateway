import { createServer } from 'node:http'

import { RPCHandler } from '@orpc/server/node'
import { CORSPlugin, RequestHeadersPlugin, ResponseHeadersPlugin } from '@orpc/server/plugins'

import { HTTP_INTERNAL_ERROR, HTTP_NOT_FOUND } from './constants'
import { appRouter } from './router'

export function orpcServer() {
  const handler = new RPCHandler(appRouter, {
    plugins: [
      new CORSPlugin({
        origin: /* getAllowedOrigins() ?? */ (origin) => origin,
        allowMethods: ['POST', 'OPTIONS', 'GET'],
        allowHeaders: ['Content-Type'],
        credentials: true,
      }),
      new RequestHeadersPlugin(),
      new ResponseHeadersPlugin(),
    ],
  })

  return createServer((req, res) => {
    handler
      .handle(req, res, { context: {} })
      .then((result) => {
        if (!result.matched) {
          res.statusCode = HTTP_NOT_FOUND
          res.end('Nenhum procedimento encontrado')
        }
      })
      .catch((error) => {
        res.statusCode = HTTP_INTERNAL_ERROR
        res.end('Internal server error')
      })
  })
}
