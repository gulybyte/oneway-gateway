import { rpc } from '../../rpc'
import { createPlan } from '../gateway/gateway.service'
import { findProductById } from '../product/product.repository'

import {
  findManyPlans,
  findPlansByProductId,
  insertPlan as insertPlanRepo,
} from './plan.repository'

import type { FindPlansByProductInput, InsertPlanInput } from './plan.model'

const planContract = rpc.plan

const findMany = planContract.findMany.handler(async () => {
  return await findManyPlans()
})

const findByProduct = planContract.findByProduct.handler(
  async ({ input }: { input: FindPlansByProductInput }) => {
    return await findPlansByProductId(input.productId)
  }
)

const insert = planContract.insert.handler(async ({ input }: { input: InsertPlanInput }) => {
  const product = await findProductById(input.productId)

  const namePlan = product.name + ' - ' + input.name
  const planProvider = await createPlan(namePlan, input.price)

  const planInput = { ...input, providerId: planProvider.id, meta: planProvider.meta }
  await insertPlanRepo(planInput)
})

export const planRouter = { findMany, findByProduct, insert }
