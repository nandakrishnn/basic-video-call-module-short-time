import path from 'path'
import { CONFIG } from '../constants/config'
import { transporter } from '../lib/nodemailer'
import { parseUtc } from '../utils/date'

const LOGO_PATH = path.join(__dirname, '../assets/clinzor-logo-white.png')
const LOGO_CID = 'clinzor-logo-white'
const logoAttachment = { filename: 'clinzor-logo-white.png', path: LOGO_PATH, cid: LOGO_CID }

const escapeHtml = (value: string): string => {
  const map: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }
  return value.replace(/[&<>"']/g, (char) => map[char] ?? char)
}

// Table-based layout (not flexbox/grid) is deliberate — it's the only layout method
// that renders consistently across email clients (Outlook in particular).
const wrapEmailHtml = (bodyHtml: string): string => `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F5F5F7;padding:32px 0;">
  <tr>
    <td align="center">
      <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border-radius:16px;overflow:hidden;font-family:Arial,Helvetica,sans-serif;">
        <tr>
          <td align="center" style="background:#1A1C6B;padding:28px 32px;">
            <img src="cid:${LOGO_CID}" alt="Clinzor" width="130" style="display:block;" />
          </td>
        </tr>
        <tr>
          <td style="padding:32px; color:#1D1D1F; font-size:15px; line-height:1.6;">
            ${bodyHtml}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`

const buttonHtml = (href: string, label: string): string =>
  `<p style="text-align:center;margin:24px 0;"><a href="${href}" style="display:inline-block;background:#1A1C6B;color:#FFFFFF;text-decoration:none;padding:12px 28px;border-radius:999px;font-weight:bold;font-size:15px;">${escapeHtml(label)}</a></p>`

export const sendOtpEmail = async (to: string, otp: string): Promise<void> => {
  const html = wrapEmailHtml(`
    <p>Your one-time verification code is:</p>
    <p style="font-size:28px;font-weight:bold;letter-spacing:0.2em;text-align:center;margin:20px 0;">${escapeHtml(otp)}</p>
    <p>It expires in ${CONFIG.otp.expiryMinutes} minutes.</p>
  `)

  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to,
    subject: 'Your Clinzor verification code',
    text: `Your one-time verification code is ${otp}. It expires in ${CONFIG.otp.expiryMinutes} minutes.`,
    html,
    attachments: [logoAttachment],
  })
}

export const sendReportEmail = async (to: string, pdfUrl: string): Promise<void> => {
  const html = wrapEmailHtml(`
    <p>Your session report is ready.</p>
    ${buttonHtml(pdfUrl, 'View Report')}
  `)

  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to,
    subject: 'Your Clinzor session report is ready',
    text: `Your session report is ready. View it here: ${pdfUrl}`,
    html,
    attachments: [logoAttachment],
  })
}

interface AppointmentScheduledDetails {
  patientName: string
  physioName: string
  scheduledAt: string
  sessionType: string
  durationMinutes: number
}

export const sendAppointmentScheduledEmail = async (
  to: string,
  details: AppointmentScheduledDetails,
): Promise<void> => {
  const scheduledDate = parseUtc(details.scheduledAt)
  const dateLabel = scheduledDate.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const timeLabel = scheduledDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })

  const patientName = escapeHtml(details.patientName)
  const physioName = escapeHtml(details.physioName)
  const sessionType = escapeHtml(details.sessionType)

  const html = wrapEmailHtml(`
    <p>Hi ${patientName},</p>
    <p>Your ${sessionType} session with ${physioName} has been scheduled.</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:20px 0;font-size:14px;">
      <tr>
        <td style="color:#6E6E73;padding:4px 0;">Date</td>
        <td style="text-align:right;font-weight:bold;padding:4px 0;">${escapeHtml(dateLabel)}</td>
      </tr>
      <tr>
        <td style="color:#6E6E73;padding:4px 0;">Time</td>
        <td style="text-align:right;font-weight:bold;padding:4px 0;">${escapeHtml(timeLabel)}</td>
      </tr>
      <tr>
        <td style="color:#6E6E73;padding:4px 0;">Duration</td>
        <td style="text-align:right;font-weight:bold;padding:4px 0;">${details.durationMinutes} minutes</td>
      </tr>
    </table>
    <p>You'll get another email with your join link shortly before the session starts.</p>
    <p>See you soon!<br/>Clinzor Team</p>
  `)

  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to,
    subject: 'Your Clinzor appointment has been scheduled',
    text: [
      `Hi ${details.patientName},`,
      '',
      `Your ${details.sessionType} session with ${details.physioName} has been scheduled.`,
      '',
      `Date: ${dateLabel}`,
      `Time: ${timeLabel}`,
      `Duration: ${details.durationMinutes} minutes`,
      '',
      "You'll get another email with your join link shortly before the session starts.",
      '',
      'See you soon!',
      'Clinzor Team',
    ].join('\n'),
    html,
    attachments: [logoAttachment],
  })
}

interface CallStartingDetails {
  patientName: string
  physioName: string
  joinLink: string
}

export const sendCallStartingEmail = async (to: string, details: CallStartingDetails): Promise<void> => {
  const now = new Date()
  const timeLabel = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })

  const patientName = escapeHtml(details.patientName)
  const physioName = escapeHtml(details.physioName)

  const html = wrapEmailHtml(`
    <p>Hi ${patientName},</p>
    <p>Your physio, ${physioName}, is ready for your session at ${escapeHtml(timeLabel)}.</p>
    ${buttonHtml(details.joinLink, 'Join Call')}
    <p style="color:#6E6E73;font-size:13px;">If the button doesn't work, copy and paste this link: ${escapeHtml(details.joinLink)}</p>
  `)

  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to,
    subject: 'Your Clinzor call is starting now',
    text: [
      `Hi ${details.patientName},`,
      '',
      `Your physio, ${details.physioName}, is ready for your session at ${timeLabel}.`,
      '',
      `Join here: ${details.joinLink}`,
      '',
      'Clinzor Team',
    ].join('\n'),
    html,
    attachments: [logoAttachment],
  })
}
