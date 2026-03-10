import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import z from 'zod'

import { plans } from '../../drizzle/schema'

export const upsertPlan = createInsertSchema(plans)
  .pick({
    productId: true,
    name: true,
    description: true,
    price: true,
  })
  .extend({
    id: z.number().optional(),
    name: z.string().min(1),
    price: z.number().positive(),
  })
  .strict()

export const selectPlan = createSelectSchema(plans)

export const findPlansByProduct = z.object({ productId: z.number() }).strict()

export const deletePlan = z.object({ id: z.number() }).strict()

export type UpsertPlanInput = z.infer<typeof upsertPlan>
export type FindPlansByProductInput = z.infer<typeof findPlansByProduct>
export type DeletePlanInput = z.infer<typeof deletePlan>
