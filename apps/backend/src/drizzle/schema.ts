import { relations, sql } from 'drizzle-orm'
import { pgTable, bigint, text, numeric, timestamp, varchar } from 'drizzle-orm/pg-core'

const getCurrentUTCDate = (): Date => {
  return new Date(new Date().toISOString())
}

export const products = pgTable('products', {
  id: bigint({ mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  description: text(),
  imageLink: text(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .default(sql`timezone('utc', now())`)
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .default(sql`timezone('utc', now())`)
    .$onUpdateFn(() => getCurrentUTCDate())
    .notNull(),
})

export const plans = pgTable('plans', {
  id: bigint({ mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
  productId: bigint('product_id', { mode: 'number' })
    .references(() => products.id, { onDelete: 'cascade' })
    .notNull(),
  name: varchar({ length: 255 }).notNull(),
  description: text(),
  price: numeric({ mode: 'number', precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .default(sql`timezone('utc', now())`)
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .default(sql`timezone('utc', now())`)
    .$onUpdateFn(() => getCurrentUTCDate())
    .notNull(),
})

export const productsRelations = relations(products, ({ many }) => ({
  plans: many(plans),
}))

export const plansRelations = relations(plans, ({ one }) => ({
  product: one(products, {
    fields: [plans.productId],
    references: [products.id],
  }),
}))
