import { rpc } from '../../rpc'

import {
  deleteProductById,
  findManyProducts,
  upsertProduct as upsertProductRepo,
} from './product.repository'

import type { DeleteProductInput, UpsertProductInput } from './product.model'

const productContract = rpc.product

const findMany = productContract.findMany.handler(async () => {
  return await findManyProducts()
})

const upsert = productContract.upsert.handler(async ({ input }: { input: UpsertProductInput }) => {
  await upsertProductRepo(input)
})

const deleteId = productContract.deleteId.handler(
  async ({ input }: { input: DeleteProductInput }) => {
    await deleteProductById(input.id)
  }
)

export const productRouter = { findMany, upsert, deleteId }
