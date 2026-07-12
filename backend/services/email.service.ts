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

export const sendReportEmail = async (to: string, pdfUrl: string): Promise<void> => {
  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to,
    subject: 'Your Clinzor session report is ready',
    text: `Your session report is ready. View it here: ${pdfUrl}`,
  })
}
