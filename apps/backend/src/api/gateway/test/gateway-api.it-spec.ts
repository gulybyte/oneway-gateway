import { client } from '../../../../test/setup'

describe('Gateway API', () => {
  describe('generateLink', () => {
    it('should generate checkout link without plan', async () => {
      const input = { id: 'user-42', productName: 'Produto A' }

      const result = await client.gateway.generateLink(input)

      expect(result.linkCheckout).toContain('user=user-42')
      expect(result.linkCheckout).toContain('product=Produto%20A')
      expect(result.linkCheckout).not.toContain('plan=')
    })

    it('should generate checkout link with plan', async () => {
      const input = { id: 'user-42', productName: 'Produto A', planName: 'Plano Básico' }

      const result = await client.gateway.generateLink(input)

      expect(result.linkCheckout).toContain('plan=')
      expect(result.linkCheckout).toContain('Plano')
    })
  })

  describe('verifyUser', () => {
    it('should return active status and linkCheckout for known user', async () => {
      const input = { id: 'user-1', productName: 'Produto A' }

      const result = await client.gateway.verifyUser(input)

      expect(result.status).toBe(true)
      expect(result.linkCheckout).toBeDefined()
      expect(result.linkCheckout).toContain('user=user-1')
    })

    it('should return inactive status without linkCheckout for unknown user', async () => {
      const input = { id: 'user-unknown', productName: 'Produto A' }

      const result = await client.gateway.verifyUser(input)

      expect(result.status).toBe(false)
      expect(result.linkCheckout).toBeUndefined()
    })
  })
})
