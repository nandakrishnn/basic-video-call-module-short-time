import { CONFIG } from '../constants/config'
import { EMAIL_FROM, EMAIL_REPLY_TO, resend } from '../lib/resend'
import { parseUtc } from '../utils/date'

/**
 * Email clients strip <style> and CSS variables, so every colour has to be an
 * inline literal. These mirror the YorPhysio tokens in src/styles/globals.css
 * — the one place outside that file where the palette is repeated.
 */
const BRAND = {
  canvas: '#FBF7F4',
  footer: '#FDF8F5',
  panel: '#473521',
  rule: '#D86F4E',
  primary: '#B55D42',
  soft: '#F9EBE6',
  border: '#F0E2DB',
  hairline: '#F4E9E2',
  text: '#3D2B1E',
  muted: '#7A6354',
  faint: '#7E6F64',
} as const

// Both marks are served by this backend (app.ts mounts /assets, and the build
// copies the folder into dist). The YorPhysio mark previously came from the
// frontend's public folder, which made every email depend on the web app being
// up and pointed at the wrong asset.
const YORPHYSIO_MARK_URL = `${CONFIG.app.backendUrl}/assets/yorphysio-logo.png`

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
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.canvas};padding:32px 0;">
  <tr>
    <td align="center">
      <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border-radius:16px;overflow:hidden;border:1px solid ${BRAND.border};font-family:Arial,Helvetica,sans-serif;">
        <tr>
          <td style="background:${BRAND.rule};font-size:0;line-height:0;height:4px;">&nbsp;</td>
        </tr>
        <tr>
          <td style="padding:22px 28px 18px;border-bottom:1px solid ${BRAND.hairline};">
            <table role="presentation" cellpadding="0" cellspacing="0">
              <tr>
                <!-- The wordmark is live text, so an inbox that blocks remote
                     images still shows the brand rather than an empty band. -->
                <td style="padding-right:10px;">
                  <img src="${YORPHYSIO_MARK_URL}" alt="YorPhysio" width="28" height="28" style="display:block;border:0;" />
                </td>
                <td style="font-size:12px;font-weight:bold;letter-spacing:0.2em;color:${BRAND.panel};">
                  YORPHYSIO
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:26px 28px 28px; color:${BRAND.text}; font-size:15px; line-height:1.65;">
            ${bodyHtml}
          </td>
        </tr>
        <tr>
          <td style="padding:16px 28px 18px;border-top:1px solid ${BRAND.hairline};background:${BRAND.footer};">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:11.5px;color:${BRAND.faint};">
              <tr>
                <td>YorPhysio &middot; Your Recovery Partner</td>
                <td align="right">Powered by Clinzor</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`

// Appointment times are stored UTC but always shown to the patient in the
// clinic's timezone, so every slot label goes through here.
const formatSlot = (isoLike: string): { dateLabel: string; timeLabel: string } => {
  const date = parseUtc(isoLike)
  return {
    dateLabel: date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: CONFIG.app.timezone,
    }),
    timeLabel: date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: CONFIG.app.timezone,
    }),
  }
}

/** Label-left / value-right rows. `strike` renders a superseded value. */
const detailTable = (rows: { label: string; value: string; strike?: boolean }[]): string => `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0 18px;font-size:13.5px;">
      ${rows
        .map(
          ({ label, value, strike }) => `<tr>
        <td style="color:${BRAND.muted};padding:7px 0;border-bottom:1px solid ${BRAND.hairline};">${label}</td>
        <td align="right" style="padding:7px 0;border-bottom:1px solid ${BRAND.hairline};${
          strike ? `color:${BRAND.faint};text-decoration:line-through;` : 'font-weight:bold;'
        }">${value}</td>
      </tr>`,
        )
        .join('')}
    </table>`

const buttonHtml = (href: string, label: string): string =>
  `<p style="text-align:center;margin:24px 0;"><a href="${href}" style="display:inline-block;background:${BRAND.primary};color:#FFFFFF;text-decoration:none;padding:12px 28px;border-radius:999px;font-weight:bold;font-size:15px;">${escapeHtml(label)}</a></p>`

export const sendOtpEmail = async (to: string, otp: string): Promise<void> => {
  const html = wrapEmailHtml(`
    <p style="margin:0 0 4px;">Here's your sign-in code.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:18px 0;">
      <tr>
        <td align="center" style="background:${BRAND.soft};border-radius:10px;padding:18px 0;font-size:30px;font-weight:bold;letter-spacing:0.26em;color:${BRAND.panel};">
          ${escapeHtml(otp)}
        </td>
      </tr>
    </table>
    <p style="margin:0;">It expires in ${CONFIG.otp.expiryMinutes} minutes. If you didn't ask for it, you can ignore this email.</p>
  `)

  await send({
    from: EMAIL_FROM,
    replyTo: EMAIL_REPLY_TO,
    to,
    subject: 'Your YorPhysio sign-in code',
    text: [
      "Here's your sign-in code.",
      '',
      otp,
      '',
      `It expires in ${CONFIG.otp.expiryMinutes} minutes. If you didn't ask for it, you can ignore this email.`,
    ].join('\n'),
    html,
  })
}

export const sendReportEmail = async (to: string, pdfUrl: string): Promise<void> => {
  const html = wrapEmailHtml(`
    <p style="margin:0;">Your physio has shared the notes from your session.</p>
    ${buttonHtml(pdfUrl, 'Open your report')}
    <p style="margin:0;color:${BRAND.muted};font-size:13px;">
      Button not working? Paste this into your browser:<br />${escapeHtml(pdfUrl)}
    </p>
  `)

  await send({
    from: EMAIL_FROM,
    replyTo: EMAIL_REPLY_TO,
    to,
    subject: 'Your YorPhysio session report is ready',
    text: [
      'Your physio has shared the notes from your session.',
      '',
      `Open your report: ${pdfUrl}`,
    ].join('\n'),
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
  const { dateLabel, timeLabel } = formatSlot(details.scheduledAt)

  const patientName = escapeHtml(details.patientName)
  const physioName = escapeHtml(details.physioName)
  const sessionType = escapeHtml(details.sessionType)

  const html = wrapEmailHtml(`
    <p style="margin:0 0 13px;font-weight:bold;">Hi ${patientName},</p>
    <p style="margin:0;">Your ${sessionType} session with ${physioName} is booked.</p>
    ${detailTable([
      { label: 'Date', value: escapeHtml(dateLabel) },
      { label: 'Time', value: escapeHtml(timeLabel) },
      { label: 'Duration', value: `${details.durationMinutes} minutes` },
    ])}
    <p style="margin:0;">We'll email your join link shortly before it starts. Nothing to install.</p>
  `)

  await send({
    from: EMAIL_FROM,
    replyTo: EMAIL_REPLY_TO,
    to,
    subject: 'Your YorPhysio session is booked',
    text: [
      `Hi ${details.patientName},`,
      '',
      `Your ${details.sessionType} session with ${details.physioName} is booked.`,
      '',
      `Date: ${dateLabel}`,
      `Time: ${timeLabel}`,
      `Duration: ${details.durationMinutes} minutes`,
      '',
      "We'll email your join link shortly before it starts. Nothing to install.",
    ].join('\n'),
    html,
  })
}

interface AppointmentRescheduledDetails {
  patientName: string
  physioName: string
  previousScheduledAt: string
  scheduledAt: string
  sessionType: string
  durationMinutes: number
}

export const sendAppointmentRescheduledEmail = async (
  to: string,
  details: AppointmentRescheduledDetails,
): Promise<void> => {
  const previous = formatSlot(details.previousScheduledAt)
  const next = formatSlot(details.scheduledAt)

  const patientName = escapeHtml(details.patientName)
  const physioName = escapeHtml(details.physioName)
  const sessionType = escapeHtml(details.sessionType)

  // The new time is what the patient needs, so it is pulled out of the table
  // and into a tinted block; the old one drops to a struck-through detail row.
  const html = wrapEmailHtml(`
    <p style="margin:0 0 13px;font-weight:bold;">Hi ${patientName},</p>
    <p style="margin:0;">Your ${sessionType} session with ${physioName} has moved. Here's the new time:</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;">
      <tr>
        <td style="background:${BRAND.soft};border-left:3px solid ${BRAND.rule};border-radius:0 8px 8px 0;padding:12px 14px;">
          <div style="font-size:11px;font-weight:bold;letter-spacing:0.09em;text-transform:uppercase;color:${BRAND.primary};">New time</div>
          <div style="font-size:16px;font-weight:bold;color:${BRAND.panel};">${escapeHtml(next.dateLabel)} &middot; ${escapeHtml(next.timeLabel)}</div>
        </td>
      </tr>
    </table>
    ${detailTable([
      {
        label: 'Previously',
        value: `${escapeHtml(previous.dateLabel)}, ${escapeHtml(previous.timeLabel)}`,
        strike: true,
      },
      { label: 'Duration', value: `${details.durationMinutes} minutes` },
    ])}
    <p style="margin:0;">No action needed — just join at the new time.</p>
  `)

  await send({
    from: EMAIL_FROM,
    replyTo: EMAIL_REPLY_TO,
    to,
    subject: 'Your YorPhysio session has been rescheduled',
    text: [
      `Hi ${details.patientName},`,
      '',
      `Your ${details.sessionType} session with ${details.physioName} has moved.`,
      '',
      `New time: ${next.dateLabel}, ${next.timeLabel}`,
      `Previously: ${previous.dateLabel}, ${previous.timeLabel}`,
      `Duration: ${details.durationMinutes} minutes`,
      '',
      'No action needed — just join at the new time.',
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
    <p style="margin:0 0 13px;font-weight:bold;">Hi ${patientName},</p>
    <p style="margin:0;">${physioName} is ready for you. Your session started at <strong>${escapeHtml(timeLabel)}</strong>.</p>
    ${buttonHtml(details.joinLink, 'Join your session')}
    <p style="margin:0;color:${BRAND.muted};font-size:13px;word-break:break-all;">
      Button not working? Paste this into your browser:<br />${escapeHtml(details.joinLink)}
    </p>
  `)

  await send({
    from: EMAIL_FROM,
    replyTo: EMAIL_REPLY_TO,
    to,
    subject: 'Your YorPhysio session is starting now',
    text: [
      `Hi ${details.patientName},`,
      '',
      `${details.physioName} is ready for you. Your session started at ${timeLabel}.`,
      '',
      `Join here: ${details.joinLink}`,
    ].join('\n'),
    html,
  })
}
