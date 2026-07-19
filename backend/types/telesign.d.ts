// telesignenterprisesdk ships no types. This declares only the surface this app uses.
declare module 'telesignenterprisesdk' {
  type TelesignCallback = (err: Error | null, body: Record<string, unknown> | null) => void

  class Verify {
    sms(callback: TelesignCallback, phoneNumber: string, optionalParams?: Record<string, string>): void
  }

  export default class Telesign {
    constructor(customerId: string, apiKey: string)
    verify: Verify
  }
}
