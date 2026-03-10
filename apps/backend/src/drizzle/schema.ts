import { relations, sql } from 'drizzle-orm'
import {
  pgTable,
  bigint,
  text,
  numeric,
  timestamp,
  varchar,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core'

const getCurrentUTCDate = (): Date => {
  return new Date(new Date().toISOString())
}

export const products = pgTable(
  'products',
  {
    id: bigint({ mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 255 }).unique().notNull(),
    description: text(),
    imageLink: text(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .default(sql`timezone('utc', now())`)
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .default(sql`timezone('utc', now())`)
      .$onUpdateFn(() => getCurrentUTCDate())
      .notNull(),
  },
  (t) => [index().on(t.createdAt), index().on(t.updatedAt), uniqueIndex().on(t.name)]
)

export const plans = pgTable(
  'plans',
  {
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
  },
  (t) => [
    index().on(t.createdAt),
    index().on(t.updatedAt),
    index().on(t.productId),
    index().on(t.name),
    uniqueIndex().on(t.productId, t.name),
  ]
)

export const productsRelations = relations(products, ({ many }) => ({
  plans: many(plans),
}))

export const plansRelations = relations(plans, ({ one }) => ({
  product: one(products, {
    fields: [plans.productId],
    references: [products.id],
  }),
}))
