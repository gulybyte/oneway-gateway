import { tdb } from '../../../../test/utils/root-db'
import * as sc from '../../../drizzle/schema'

export async function createDefaultProduct(overrides?: Partial<typeof sc.products.$inferInsert>) {
  const [product] = await tdb
    .insert(sc.products)
    .values({ name: 'Produto Padrão', ...overrides })
    .returning()
  return product!
}
