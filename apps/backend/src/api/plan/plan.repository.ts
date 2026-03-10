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

export async function insertPlan(input: {
  productId: number
  name: string
  description?: string | null
  price: number
  providerId: string
  meta: Record<string, any>
}) {
  try {
    const [created] = await db
      .insert(plans)
      .values({ ...input })
      .returning()
    return created!
  } catch (error: any) {
    if (error.cause?.code === '23505')
      throw new ORPCError('BAD_REQUEST', { message: 'Nome do plano já existe para este produto' })

    throw error
  }
}
