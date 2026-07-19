import Telesign from 'telesignenterprisesdk'

export const telesignClient = new Telesign(
  process.env.TELESIGN_CUSTOMER_ID ?? '',
  process.env.TELESIGN_API_KEY ?? '',
)
