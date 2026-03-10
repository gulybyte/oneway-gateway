import { tdb } from '../../../../test/utils/root-db'
import * as sc from '../../../drizzle/schema'
import { createDefaultProduct } from '../../product/test/creator-product.it-spec.helper'

export async function createDefaultPlan(
  productId: number,
  overrides?: Partial<typeof sc.plans.$inferInsert>
) {
  const [plan] = await tdb
    .insert(sc.plans)
    .values({ productId, name: 'Plano Padrão', price: 19.9, ...overrides })
    .returning()
  return plan!
}

export async function createDefaultProductWithPlan() {
  const product = await createDefaultProduct()
  const plan = await createDefaultPlan(Number(product.id))
  return { product, plan }
}
