import { client } from '../../../../test/setup'
import { createDefaultProduct } from '../../product/test/creator-product.it-spec.helper'

import { createDefaultPlan, createDefaultProductWithPlan } from './creator-plan.it-spec.helper'

describe('Plan API', () => {
  describe('findMany', () => {
    it('should return empty list when no plans exist', async () => {
      const response = await client.plan.findMany()

      expect(response).toBeInstanceOf(Array)
      expect(response).toHaveLength(0)
    })

    it('should return list with plans and their product', async () => {
      const { product } = await createDefaultProductWithPlan()
      await createDefaultPlan(Number(product.id), { name: 'Plano Premium', price: 49.9 })

      const response = await client.plan.findMany()

      expect(response).toBeInstanceOf(Array)
      expect(response).toHaveLength(2)
      expect(response[0]).toHaveProperty('product')
      expect(response[0]!.product).toHaveProperty('name')
    })
  })

  describe('findByProduct', () => {
    it('should return plans for a specific product ordered by price asc', async () => {
      const { product } = await createDefaultProductWithPlan()
      await createDefaultPlan(Number(product.id), { name: 'Plano Caro', price: 99.9 })
      await createDefaultPlan(Number(product.id), { name: 'Plano Barato', price: 9.9 })

      const response = await client.plan.findByProduct({ productId: Number(product.id) })

      expect(response).toBeInstanceOf(Array)
      expect(response).toHaveLength(3)
      expect(response[0]!.price).toBeLessThanOrEqual(response[1]!.price)
      expect(response[1]!.price).toBeLessThanOrEqual(response[2]!.price)
    })

    it('should return empty list when product has no plans', async () => {
      const product = await createDefaultProduct({ name: 'Produto Sem Planos' })

      const response = await client.plan.findByProduct({ productId: Number(product.id) })

      expect(response).toBeInstanceOf(Array)
      expect(response).toHaveLength(0)
    })
  })

  describe('upsert (create)', () => {
    it('should create a new plan', async () => {
      const product = await createDefaultProduct()
      const input = { productId: Number(product.id), name: 'Novo Plano', price: 29.9 }

      await client.plan.upsert(input)

      const plans = await client.plan.findByProduct({ productId: Number(product.id) })
      expect(plans).toHaveLength(1)
      expect(plans[0]!.name).toBe('Novo Plano')
    })

    it('should throw when productId does not exist', async () => {
      const promise = client.plan.upsert({ productId: 99999, name: 'Plano', price: 10 })

      await expect(promise).rejects.toThrow()
    })
  })

  describe('upsert (update)', () => {
    it('should update an existing plan', async () => {
      const { product, plan } = await createDefaultProductWithPlan()

      await client.plan.upsert({
        id: Number(plan.id),
        productId: Number(product.id),
        name: 'Plano Atualizado',
        price: 39.9,
      })

      const plans = await client.plan.findByProduct({ productId: Number(product.id) })
      expect(plans[0]!.name).toBe('Plano Atualizado')
      expect(plans[0]!.price).toBe(39.9)
    })

    it('should throw NOT_FOUND when updating non-existent plan', async () => {
      const product = await createDefaultProduct()

      const promise = client.plan.upsert({
        id: 99999,
        productId: Number(product.id),
        name: 'Inexistente',
        price: 10,
      })

      await expect(promise).rejects.toThrow()
    })
  })

  describe('deleteId', () => {
    it('should delete an existing plan', async () => {
      const { product, plan } = await createDefaultProductWithPlan()

      await client.plan.deleteId({ id: Number(plan.id) })

      const plans = await client.plan.findByProduct({ productId: Number(product.id) })
      expect(plans).toHaveLength(0)
    })

    it('should throw NOT_FOUND when deleting non-existent plan', async () => {
      const promise = client.plan.deleteId({ id: 99999 })

      await expect(promise).rejects.toThrow()
    })
  })
})
