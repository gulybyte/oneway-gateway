import { ContractRouterClient, oc } from '@orpc/contract'
import { z } from 'zod'

import { deletePlan, findPlansByProduct, selectPlan, upsertPlan } from './api/plan/plan.model'
import { deleteProduct, selectProduct, upsertProduct } from './api/product/product.model'

const productRouter = {
  findMany: oc.output(z.array(selectProduct.extend({ plans: z.array(selectPlan) }))),
  upsert: oc.input(upsertProduct).output(z.void()),
  deleteId: oc.input(deleteProduct).output(z.void()),
}

const planRouter = {
  findMany: oc.output(z.array(selectPlan.extend({ product: selectProduct }))),
  findByProduct: oc.input(findPlansByProduct).output(z.array(selectPlan)),
  upsert: oc.input(upsertPlan).output(z.void()),
  deleteId: oc.input(deletePlan).output(z.void()),
}

export const contract = {
  product: productRouter,
  plan: planRouter,
}

export type AppClientContract = ContractRouterClient<typeof contract>
