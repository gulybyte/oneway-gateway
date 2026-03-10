import { client } from '../../../../test/setup'

import { createDefaultProduct } from './creator-product.it-spec.helper'

describe('Product API', () => {
  describe('findMany', () => {
    it('should return empty list when no products exist', async () => {
      const response = await client.product.findMany()

      expect(response).toBeInstanceOf(Array)
      expect(response).toHaveLength(0)
    })

    it('should return list with products and their plans', async () => {
      await createDefaultProduct({ name: 'Produto A' })
      await createDefaultProduct({ name: 'Produto B' })

      const response = await client.product.findMany()

      expect(response).toBeInstanceOf(Array)
      expect(response).toHaveLength(2)
      expect(response[0]).toHaveProperty('plans')
      expect(response[0]!.plans).toBeInstanceOf(Array)
    })

    it('should return products ordered by createdAt descending', async () => {
      await createDefaultProduct({ name: 'Produto Antigo' })
      await createDefaultProduct({ name: 'Produto Novo' })

      const response = await client.product.findMany()

      expect(response[0]!.name).toBe('Produto Novo')
      expect(response[1]!.name).toBe('Produto Antigo')
    })
  })

  describe('upsert (create)', () => {
    it('should create a new product', async () => {
      const input = { name: 'Novo Produto' }

      await client.product.upsert(input)

      const products = await client.product.findMany()
      expect(products).toHaveLength(1)
      expect(products[0]!.name).toBe('Novo Produto')
    })

    it('should create a product with description and imageLink', async () => {
      const input = {
        name: 'Produto Completo',
        description: 'Descrição detalhada',
        imageLink: 'https://example.com/img.png',
      }

      await client.product.upsert(input)

      const products = await client.product.findMany()
      expect(products[0]!.description).toBe('Descrição detalhada')
      expect(products[0]!.imageLink).toBe('https://example.com/img.png')
    })

    it('should throw when product name is duplicated', async () => {
      await createDefaultProduct({ name: 'Duplicado' })

      const promise = client.product.upsert({ name: 'Duplicado' })

      await expect(promise).rejects.toThrow()
    })
  })

  describe('upsert (update)', () => {
    it('should update an existing product', async () => {
      const created = await createDefaultProduct({ name: 'Produto Original' })

      await client.product.upsert({ id: Number(created.id), name: 'Produto Atualizado' })

      const products = await client.product.findMany()
      expect(products[0]!.name).toBe('Produto Atualizado')
    })

    it('should throw NOT_FOUND when updating non-existent product', async () => {
      const promise = client.product.upsert({ id: 99999, name: 'Inexistente' })

      await expect(promise).rejects.toThrow()
    })
  })
})
