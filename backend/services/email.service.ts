import { CONFIG } from '../constants/config'
import { EMAIL_FROM, EMAIL_REPLY_TO, resend } from '../lib/resend'
import { parseUtc } from '../utils/date'

const LOGO_URL = `${CONFIG.app.backendUrl}/assets/clinzor-logo-white.png`
const FOOTER_LOGO_URL = `${CONFIG.app.backendUrl}/assets/clinzor-logo.png`
// Served from the frontend's /public folder, not the backend.
const YOURPHYSIO_LOGO_URL = `${CONFIG.app.url}/yorphysio-mark.webp`

// The Resend SDK resolves with { data, error } instead of throwing on API
// errors, so callers must check `error` explicitly or failures go unnoticed.
const send = async (params: Parameters<typeof resend.emails.send>[0]): Promise<void> => {
  const { error } = await resend.emails.send(params)
  if (error) {
    throw new Error(`Resend error (${error.name}): ${error.message}`)
  }
}

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
            <img src="${LOGO_URL}" alt="Clinzor" width="130" style="display:block;" />
          </td>
        </tr>
        <tr>
          <td style="padding:32px; color:#1D1D1F; font-size:15px; line-height:1.6;">
            ${bodyHtml}
          </td>
        </tr>
        <tr>
          <td align="center" style="padding:20px 32px 28px; border-top:1px solid #F0F0F2;">
            <p style="margin:0 0 10px; color:#86868B; font-size:12px;">Co-powered by</p>
            <table role="presentation" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding-right:14px;">
                  <img src="${FOOTER_LOGO_URL}" alt="Clinzor" width="72" style="display:block;" />
                </td>
                <td style="border-left:1px solid #F0F0F2; padding-left:14px;">
                  <img src="${YOURPHYSIO_LOGO_URL}" alt="YourPhysio" width="72" style="display:block;" />
                </td>
              </tr>
            </table>
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

  await send({
    from: EMAIL_FROM,
    replyTo: EMAIL_REPLY_TO,
    to,
    subject: 'Your Clinzor verification code',
    text: `Your one-time verification code is ${otp}. It expires in ${CONFIG.otp.expiryMinutes} minutes.`,
    html,
  })
}

export const sendReportEmail = async (to: string, pdfUrl: string): Promise<void> => {
  const html = wrapEmailHtml(`
    <p>Your session report is ready.</p>
    ${buttonHtml(pdfUrl, 'View Report')}
  `)

  await send({
    from: EMAIL_FROM,
    replyTo: EMAIL_REPLY_TO,
    to,
    subject: 'Your Clinzor session report is ready',
    text: `Your session report is ready. View it here: ${pdfUrl}`,
    html,
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
  const dateLabel = scheduledDate.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: CONFIG.app.timezone,
  })
  const timeLabel = scheduledDate.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: CONFIG.app.timezone,
  })

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

  await send({
    from: EMAIL_FROM,
    replyTo: EMAIL_REPLY_TO,
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
  })
}

interface CallStartingDetails {
  patientName: string
  physioName: string
  joinLink: string
}

export const sendCallStartingEmail = async (to: string, details: CallStartingDetails): Promise<void> => {
  const now = new Date()
  const timeLabel = now.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: CONFIG.app.timezone,
  })

  const patientName = escapeHtml(details.patientName)
  const physioName = escapeHtml(details.physioName)

  const html = wrapEmailHtml(`
    <p>Hi ${patientName},</p>
    <p>Your physio, ${physioName}, is ready for your session at ${escapeHtml(timeLabel)}.</p>
    ${buttonHtml(details.joinLink, 'Join Call')}
    <p style="color:#6E6E73;font-size:13px;">If the button doesn't work, copy and paste this link: ${escapeHtml(details.joinLink)}</p>
  `)

  await send({
    from: EMAIL_FROM,
    replyTo: EMAIL_REPLY_TO,
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
  })
}
