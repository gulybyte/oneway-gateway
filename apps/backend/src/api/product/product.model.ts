import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import z from 'zod'

import { products } from '../../drizzle/schema'

export const upsertProduct = createInsertSchema(products)
  .pick({
    name: true,
    description: true,
    imageLink: true,
  })
  .extend({
    id: z.number().optional(),
    name: z.string().min(1),
  })
  .strict()

export const selectProduct = createSelectSchema(products)

export const deleteProduct = z.object({ id: z.number() }).strict()

export type UpsertProductInput = z.infer<typeof upsertProduct>
export type DeleteProductInput = z.infer<typeof deleteProduct>
