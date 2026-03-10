import { upsertPlan, findPlansByProduct, deletePlan } from '../plan.model'

describe('upsertPlan', () => {
  const validPlan = { productId: 1, name: 'Plano Básico', price: 29.9 }

  it('should accept valid minimum data', () => {
    const result = upsertPlan.safeParse(validPlan)
    expect(result.success).toBe(true)
  })

  it('should accept complete data', () => {
    const result = upsertPlan.safeParse({
      ...validPlan,
      description: 'Descrição do plano',
    })
    expect(result.success).toBe(true)
  })

  it('should accept optional id for update', () => {
    const result = upsertPlan.safeParse({ ...validPlan, id: 1 })
    expect(result.success).toBe(true)
  })

  it('should reject missing name', () => {
    const result = upsertPlan.safeParse({ productId: 1, price: 10 })
    expect(result.success).toBe(false)
  })

  it('should reject empty name', () => {
    const result = upsertPlan.safeParse({ ...validPlan, name: '' })
    expect(result.success).toBe(false)
  })

  it('should reject missing productId', () => {
    const result = upsertPlan.safeParse({ name: 'Plano', price: 10 })
    expect(result.success).toBe(false)
  })

  it('should reject missing price', () => {
    const result = upsertPlan.safeParse({ productId: 1, name: 'Plano' })
    expect(result.success).toBe(false)
  })

  it('should reject zero price', () => {
    const result = upsertPlan.safeParse({ ...validPlan, price: 0 })
    expect(result.success).toBe(false)
  })

  it('should reject negative price', () => {
    const result = upsertPlan.safeParse({ ...validPlan, price: -5 })
    expect(result.success).toBe(false)
  })

  it('should reject extra fields', () => {
    const result = upsertPlan.safeParse({ ...validPlan, extraField: 'x' })
    expect(result.success).toBe(false)
  })
})

describe('findPlansByProduct', () => {
  it('should accept valid productId', () => {
    const result = findPlansByProduct.safeParse({ productId: 1 })
    expect(result.success).toBe(true)
  })

  it('should reject missing productId', () => {
    const result = findPlansByProduct.safeParse({})
    expect(result.success).toBe(false)
  })

  it('should reject extra fields', () => {
    const result = findPlansByProduct.safeParse({ productId: 1, extra: true })
    expect(result.success).toBe(false)
  })
})

describe('deletePlan', () => {
  it('should accept valid id', () => {
    const result = deletePlan.safeParse({ id: 1 })
    expect(result.success).toBe(true)
  })

  it('should reject missing id', () => {
    const result = deletePlan.safeParse({})
    expect(result.success).toBe(false)
  })

  it('should reject extra fields', () => {
    const result = deletePlan.safeParse({ id: 1, extra: true })
    expect(result.success).toBe(false)
  })
})
