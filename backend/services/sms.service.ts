import { telesignClient } from '../lib/telesign'

const toE164 = (phoneNumber: string): string => (phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`)

export const sendOtpSms = (phoneNumber: string, otp: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    telesignClient.verify.sms(
      (err, body) => {
        if (err) {
          reject(err)
          return
        }
        const status = (body?.status as { code?: number; description?: string } | undefined) ?? {}
        if (!status.code || status.code >= 300) {
          reject(new Error(`TeleSign SMS failed: ${status.description ?? JSON.stringify(body)}`))
          return
        }
        resolve()
      },
      toE164(phoneNumber),
      { verify_code: otp },
    )
  })
}
