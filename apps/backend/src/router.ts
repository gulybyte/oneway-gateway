import { os } from '@orpc/server'

import { gatewayRouter } from './api/gateway/gateway.route'
import { planRouter } from './api/plan/plan.route'
import { productRouter } from './api/product/product.route'

export const appRouter = os.router({
  product: productRouter,
  plan: planRouter,
  gateway: gatewayRouter,
})
