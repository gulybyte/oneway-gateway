import { upsertProduct, deleteProduct } from '../product.model'

describe('upsertProduct', () => {
  const validProduct = { name: 'Produto Teste' }

  it('should accept valid minimum data', () => {
    const result = upsertProduct.safeParse(validProduct)
    expect(result.success).toBe(true)
  })

  it('should accept complete data', () => {
    const result = upsertProduct.safeParse({
      name: 'Produto Completo',
      description: 'Descrição do produto',
      imageLink: 'https://example.com/img.png',
    })
    expect(result.success).toBe(true)
  })

  it('should accept optional id for update', () => {
    const result = upsertProduct.safeParse({ ...validProduct, id: 1 })
    expect(result.success).toBe(true)
  })

  it('should reject missing name', () => {
    const result = upsertProduct.safeParse({})
    expect(result.success).toBe(false)
  })

  it('should reject empty name', () => {
    const result = upsertProduct.safeParse({ name: '' })
    expect(result.success).toBe(false)
  })

  it('should reject extra fields', () => {
    const result = upsertProduct.safeParse({ ...validProduct, extraField: 'x' })
    expect(result.success).toBe(false)
  })
})

describe('deleteProduct', () => {
  it('should accept valid id', () => {
    const result = deleteProduct.safeParse({ id: 1 })
    expect(result.success).toBe(true)
  })

  it('should reject missing id', () => {
    const result = deleteProduct.safeParse({})
    expect(result.success).toBe(false)
  })

  it('should reject string id', () => {
    const result = deleteProduct.safeParse({ id: 'abc' })
    expect(result.success).toBe(false)
  })

  it('should reject extra fields', () => {
    const result = deleteProduct.safeParse({ id: 1, extra: true })
    expect(result.success).toBe(false)
  })
})
