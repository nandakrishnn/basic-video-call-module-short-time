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
          /* Mirrors the YorPhysio tokens in src/styles/globals.css. The PDF is
             rendered by Chrome in this process and cannot import that file, so
             these are the one place the palette is repeated — keep in sync. */
          body { font-family: 'Inter', Arial, sans-serif; color: #3D2B1E; padding: 40px; }
          h1 { color: #473521; font-size: 22px; margin-bottom: 4px; }
          .meta { color: #7A6354; font-size: 13px; margin-bottom: 24px; }
          .divider { border-top: 1px solid #F0E2DB; margin: 20px 0; }
          .notes { white-space: pre-wrap; font-size: 14px; line-height: 1.7; }
          .footer { margin-top: 40px; color: #7E6F64; font-size: 11px; }
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
  // --disable-dev-shm-usage matters on Render: the container's /dev/shm is tiny
  // and Chrome crashes mid-render without it. --no-sandbox is required since
  // the process runs as root in that container.
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
  })
  try {
    const page = await browser.newPage()
    await page.setContent(buildHtml(data), { waitUntil: 'networkidle0' })
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true })
    return Buffer.from(pdfBuffer)
  } finally {
    await browser.close()
  }
}
