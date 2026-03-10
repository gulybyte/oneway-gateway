import { rpc } from '../../rpc'

import { findManyProducts, upsertProduct as upsertProductRepo } from './product.repository'

import type { UpsertProductInput } from './product.model'

const productContract = rpc.product

const findMany = productContract.findMany.handler(async () => {
  return await findManyProducts()
})

const upsert = productContract.upsert.handler(async ({ input }: { input: UpsertProductInput }) => {
  await upsertProductRepo(input)
})

export const productRouter = { findMany, upsert }
