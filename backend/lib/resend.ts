import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY)

// EMAIL_FROM is set in the environment; EMAIL_REPLY_TO is not, so the fallback
// below is the reply-to patients actually see. Sending from yorphysio.com needs
// that domain verified in Resend — an unverified sender is rejected outright
// rather than delivered from somewhere else.
export const EMAIL_FROM = process.env.EMAIL_FROM ?? 'YorPhysio <noreply@yorphysio.com>'
export const EMAIL_REPLY_TO = process.env.EMAIL_REPLY_TO ?? 'yorphysio@gmail.com'
