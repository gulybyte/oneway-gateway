import { rpc } from '../../rpc'

import {
  deletePlanById,
  findManyPlans,
  findPlansByProductId,
  upsertPlan as upsertPlanRepo,
} from './plan.repository'

import type { DeletePlanInput, FindPlansByProductInput, UpsertPlanInput } from './plan.model'

const planContract = rpc.plan

const findMany = planContract.findMany.handler(async () => {
  return await findManyPlans()
})

const findByProduct = planContract.findByProduct.handler(
  async ({ input }: { input: FindPlansByProductInput }) => {
    return await findPlansByProductId(input.productId)
  }
)

const upsert = planContract.upsert.handler(async ({ input }: { input: UpsertPlanInput }) => {
  await upsertPlanRepo(input)
})

const deleteId = planContract.deleteId.handler(async ({ input }: { input: DeletePlanInput }) => {
  await deletePlanById(input.id)
})

export const planRouter = { findMany, findByProduct, upsert, deleteId }
