import puppeteer from 'puppeteer'

interface PdfReportData {
  patientName: string
  patientDob: string | null
  sessionDate: string
  sessionNumber: number
  physioName: string
  physioSpecialization: string | null
  enhancedNotes: string
  nextAppointment: string | null
}

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const buildHtml = (data: PdfReportData): string => {
  const patientName = escapeHtml(data.patientName)
  const physioName = escapeHtml(data.physioName)
  const enhancedNotes = escapeHtml(data.enhancedNotes)
  const nextAppointment = data.nextAppointment ? escapeHtml(data.nextAppointment) : null

  return `
    <html>
      <head>
        <style>
          body { font-family: 'Inter', sans-serif; color: #1D1D1F; padding: 40px; }
          h1 { font-family: 'Nunito', sans-serif; color: #1A1C6B; font-size: 22px; margin-bottom: 4px; }
          .meta { color: #6E6E73; font-size: 13px; margin-bottom: 24px; }
          .divider { border-top: 1px solid #E5E5EA; margin: 20px 0; }
          .notes { white-space: pre-wrap; font-size: 14px; line-height: 1.7; }
          .footer { margin-top: 40px; color: #86868B; font-size: 11px; }
        </style>
      </head>
      <body>
        <h1>Clinzor — Session Report</h1>
        <div class="meta">
          <div><strong>Patient:</strong> ${patientName}${data.patientDob ? ` · DOB ${escapeHtml(data.patientDob)}` : ''}</div>
          <div><strong>Session:</strong> #${data.sessionNumber} · ${escapeHtml(data.sessionDate)}</div>
          <div><strong>Physiotherapist:</strong> ${physioName}${data.physioSpecialization ? ` · ${escapeHtml(data.physioSpecialization)}` : ''}</div>
        </div>
        <div class="divider"></div>
        <div class="notes">${enhancedNotes}</div>
        ${nextAppointment ? `<div class="divider"></div><div><strong>Next appointment:</strong> ${nextAppointment}</div>` : ''}
        <div class="footer">Clinzor · contact@clinzor.com · clinzor.com</div>
      </body>
    </html>
  `
}

export const generateReportPdf = async (data: PdfReportData): Promise<Buffer> => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] })
  try {
    const page = await browser.newPage()
    await page.setContent(buildHtml(data), { waitUntil: 'networkidle0' })
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true })
    return Buffer.from(pdfBuffer)
  } finally {
    await browser.close()
  }
}
