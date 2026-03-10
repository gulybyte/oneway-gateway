import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import z from 'zod'

import { plans } from '../../drizzle/schema'

export const insertPlan = createInsertSchema(plans)
  .pick({
    productId: true,
    name: true,
    description: true,
    price: true,
  })
  .extend({
    name: z.string().min(1),
    price: z.number().positive(),
  })
  .strict()

export const selectPlan = createSelectSchema(plans)

export const findPlansByProduct = z.object({ productId: z.number() }).strict()

export type InsertPlanInput = z.infer<typeof insertPlan>
export type FindPlansByProductInput = z.infer<typeof findPlansByProduct>
