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

export type UpsertProductInput = z.infer<typeof upsertProduct>
