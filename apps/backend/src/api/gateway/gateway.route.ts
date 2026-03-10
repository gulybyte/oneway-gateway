import { rpc } from '../../rpc'

const gatewayContract = rpc.gateway

const generateLink = gatewayContract.generateLink.handler(
  async ({ input }: { input: { id: string; productName: string; planName?: string } }) => {
    const plan = input.planName ? `&plan=${encodeURIComponent(input.planName)}` : ''
    return {
      linkCheckout: `https://checkout.mock/pay?user=${encodeURIComponent(input.id)}&product=${encodeURIComponent(input.productName)}${plan}`,
    }
  }
)

const verifyUser = gatewayContract.verifyUser.handler(
  async ({ input }: { input: { id: string; productName: string } }) => {
    const mockActiveUsers = ['user-1', 'user-2', 'user-3']
    const isActive = mockActiveUsers.includes(input.id)
    return {
      status: isActive,
      ...(isActive && {
        linkCheckout: `https://checkout.mock/manage?user=${encodeURIComponent(input.id)}&product=${encodeURIComponent(input.productName)}`,
      }),
    }
  }
)

export const gatewayRouter = { generateLink, verifyUser }
