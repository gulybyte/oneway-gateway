import { ORPCError } from '@orpc/server'
import { eq } from 'drizzle-orm'

import { db } from '../../drizzle/drizzle'
import { plans } from '../../drizzle/schema'

export async function findManyPlans() {
  return await db.query.plans.findMany({
    with: { product: true },
    orderBy: (plans, { desc }) => [desc(plans.createdAt)],
  })
}

export async function findPlansByProductId(productId: number) {
  return await db.query.plans.findMany({
    where: eq(plans.productId, productId),
    orderBy: (plans, { asc }) => [asc(plans.price)],
  })
}

export async function upsertPlan(input: {
  id?: number
  productId: number
  name: string
  description?: string | null
  price: number
}) {
  if (input.id != null) {
    const { id, ...data } = input
    const [updated] = await db.update(plans).set(data).where(eq(plans.id, id)).returning()
    if (!updated) throw new ORPCError('NOT_FOUND', { message: 'Plano não encontrado' })
    return updated
  }

  const { id: _id, ...data } = input
  const [created] = await db.insert(plans).values(data).returning()
  return created!
}

export async function deletePlanById(id: number) {
  const [deleted] = await db.delete(plans).where(eq(plans.id, id)).returning()
  if (!deleted) throw new ORPCError('NOT_FOUND', { message: 'Plano não encontrado' })
  return deleted
}
