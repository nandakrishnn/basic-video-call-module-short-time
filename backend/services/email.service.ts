import { CONFIG } from '../constants/config'
import { transporter } from '../lib/nodemailer'

export const sendOtpEmail = async (to: string, otp: string): Promise<void> => {
  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to,
    subject: 'Your Clinzor verification code',
    text: `Your one-time verification code is ${otp}. It expires in ${CONFIG.otp.expiryMinutes} minutes.`,
  })
}
