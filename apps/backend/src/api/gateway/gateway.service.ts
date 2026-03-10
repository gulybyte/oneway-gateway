import { MercadoPagoConfig, PreApprovalPlan } from 'mercadopago'

const client = new MercadoPagoConfig({ accessToken: String(process.env.MERCADO_PAGO_ACCESS_TOKEN) })

export async function createPlan(name: string, price: number) {
  const preApprovalPlan = new PreApprovalPlan(client)
  const plan = await preApprovalPlan.create({
    body: {
      reason: name,
      back_url: 'https://www.mercadopago.com.br',
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: price,
        currency_id: 'BRL',
      },
    },
  })

  return { id: plan.id as string, meta: plan }
}
