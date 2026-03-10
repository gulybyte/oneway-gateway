import { ORPCError } from '@orpc/server'
import { eq } from 'drizzle-orm'

import { db } from '../../drizzle/drizzle'
import { products } from '../../drizzle/schema'

export async function findManyProducts() {
  return await db.query.products.findMany({
    with: { plans: true },
    orderBy: (products, { desc }) => [desc(products.createdAt)],
  })
}

export async function upsertProduct(input: {
  id?: number
  name: string
  description?: string | null
  imageLink?: string | null
}) {
  if (input.id != null) {
    const { id, ...data } = input
    const [updated] = await db.update(products).set(data).where(eq(products.id, id)).returning()
    if (!updated) throw new ORPCError('NOT_FOUND', { message: 'Produto não encontrado' })
    return updated
  }

  const { id: _id, ...data } = input
  const [created] = await db.insert(products).values(data).returning()
  return created!
}

export async function deleteProductById(id: number) {
  const [deleted] = await db.delete(products).where(eq(products.id, id)).returning()
  if (!deleted) throw new ORPCError('NOT_FOUND', { message: 'Produto não encontrado' })
  return deleted
}
