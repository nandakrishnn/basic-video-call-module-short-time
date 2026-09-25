import { readFileSync } from 'fs'
import { join } from 'path'
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

// Section headings written by the notes editor. Kept in step with
// NOTE_SECTIONS in src/utils/notes.ts — the frontend cannot be imported here.
const SECTION_HEADINGS = [
  'PRESENTING COMPLAINT',
  'TREATMENT PROVIDED',
  'PATIENT RESPONSE',
  'RECOMMENDATIONS',
  'NEXT STEPS',
] as const

/**
 * Inlined rather than fetched: Chrome renders this page with no network access
 * to our own host, and a remote <img> would silently come out blank. Read once
 * — generateReportPdf can be called repeatedly.
 */
const MARK_DATA_URI = (() => {
  try {
    const file = readFileSync(join(__dirname, '..', 'assets', 'yorphysio-mark-120.png'))
    return `data:image/png;base64,${file.toString('base64')}`
  } catch {
    // A missing asset must not take the whole report down.
    console.error('Report logo missing — rendering the report without it.')
    return null
  }
})()

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

/** Splits the stored notes into their sections for styling. */
const splitSections = (notes: string): { heading: string; body: string }[] => {
  const pattern = new RegExp(`^(${SECTION_HEADINGS.join('|')}):\\s*$`, 'i')
  const sections: { heading: string; body: string[] }[] = []
  const preamble: string[] = []

  for (const line of notes.split(/\r?\n/)) {
    const match = line.trim().match(pattern)
    if (match) sections.push({ heading: match[1]!.toUpperCase(), body: [] })
    else if (sections.length) sections[sections.length - 1]!.body.push(line)
    else preamble.push(line)
  }

  // Notes written before the structured editor have no headings at all.
  if (!sections.length) {
    const body = preamble.join('\n').trim()
    return body ? [{ heading: 'SESSION NOTES', body }] : []
  }

  return sections.map(({ heading, body }) => ({ heading, body: body.join('\n').trim() }))
}

/** Exported so the layout can be rendered and checked without producing a PDF. */
export const buildHtml = (data: PdfReportData): string => {
  const sections = splitSections(data.enhancedNotes)

  const metaRow = (label: string, value: string): string => `
    <div class="meta-item">
      <span class="meta-label">${label}</span>
      <span class="meta-value">${escapeHtml(value)}</span>
    </div>`

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <style>
      /* Mirrors the YorPhysio tokens in src/styles/globals.css. Chrome renders
         this in isolation, so the palette is repeated here by necessity. */
      :root {
        --ink: #3D2B1E;
        --muted: #7A6354;
        --faint: #7E6F64;
        --rule: #D86F4E;
        --accent: #B55D42;
        --deep: #473521;
        --hairline: #F0E2DB;
        --tint: #FDF6F4;
      }

      @page { size: A4; margin: 18mm 16mm 20mm; }

      * { box-sizing: border-box; }

      body {
        margin: 0;
        font-family: Helvetica, Arial, sans-serif;
        color: var(--ink);
        font-size: 11.5pt;
        line-height: 1.6;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      .masthead {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-bottom: 12px;
        border-bottom: 3px solid var(--rule);
      }

      .brand { display: flex; align-items: center; gap: 10px; }
      .brand img { width: 30px; height: 30px; display: block; }
      .wordmark {
        font-size: 11pt; font-weight: bold; letter-spacing: 0.2em; color: var(--deep);
      }
      .doc-type {
        font-size: 9pt; font-weight: bold; letter-spacing: 0.14em;
        text-transform: uppercase; color: var(--accent);
      }

      h1 {
        margin: 22px 0 4px;
        font-size: 19pt;
        color: var(--deep);
        letter-spacing: -0.01em;
      }
      .subtitle { margin: 0 0 20px; color: var(--muted); font-size: 10pt; }

      .meta {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px 24px;
        padding: 14px 16px;
        background: var(--tint);
        border: 1px solid var(--hairline);
        border-radius: 8px;
        margin-bottom: 26px;
      }
      .meta-item { display: flex; flex-direction: column; gap: 1px; }
      .meta-label {
        font-size: 7.5pt; font-weight: bold; letter-spacing: 0.1em;
        text-transform: uppercase; color: var(--faint);
      }
      .meta-value { font-size: 10.5pt; font-weight: bold; }

      /* A section must not be split across a page break mid-heading. */
      .section { margin-bottom: 20px; break-inside: avoid; }
      .section h2 {
        margin: 0 0 5px;
        padding-bottom: 4px;
        border-bottom: 1px solid var(--hairline);
        font-size: 8.5pt;
        font-weight: bold;
        letter-spacing: 0.11em;
        text-transform: uppercase;
        color: var(--accent);
      }
      .section p { margin: 0; white-space: pre-wrap; }
      .section p.empty { color: var(--faint); font-style: italic; }

      .next {
        margin-top: 8px;
        padding: 12px 14px;
        background: var(--tint);
        border-left: 3px solid var(--rule);
        border-radius: 0 6px 6px 0;
      }
      .next span {
        display: block; font-size: 7.5pt; font-weight: bold; letter-spacing: 0.1em;
        text-transform: uppercase; color: var(--accent);
      }
      .next strong { font-size: 11pt; color: var(--deep); }

      .footer {
        margin-top: 30px;
        padding-top: 12px;
        border-top: 1px solid var(--hairline);
        display: flex;
        justify-content: space-between;
        gap: 16px;
        font-size: 8pt;
        color: var(--faint);
      }
    </style>
  </head>
  <body>
    <div class="masthead">
      <div class="brand">
        ${MARK_DATA_URI ? `<img src="${MARK_DATA_URI}" alt="YorPhysio" />` : ''}
        <span class="wordmark">YORPHYSIO</span>
      </div>
      <span class="doc-type">Session Report</span>
    </div>

    <h1>${escapeHtml(data.patientName)}</h1>
    <p class="subtitle">Session on ${escapeHtml(data.sessionDate)}</p>

    <div class="meta">
      ${metaRow('Patient', data.patientName)}
      ${data.patientDob ? metaRow('Date of birth', data.patientDob) : ''}
      ${metaRow('Physiotherapist', data.physioName)}
      ${data.physioSpecialization ? metaRow('Specialisation', data.physioSpecialization) : ''}
    </div>

    ${
      sections.length
        ? sections
            .map(({ heading, body }) => {
              // "Not documented." is stored as literal text, so match on it too —
              // otherwise an absent section reads like recorded clinical content.
              const isBlank = !body || body.toLowerCase() === 'not documented.'
              return `
    <div class="section">
      <h2>${escapeHtml(heading)}</h2>
      <p${isBlank ? ' class="empty"' : ''}>${escapeHtml(isBlank ? 'Not documented.' : body)}</p>
    </div>`
            })
            .join('')
        : '<div class="section"><p class="empty">No notes recorded for this session.</p></div>'
    }

    ${
      data.nextAppointment
        ? `<div class="next"><span>Next appointment</span><strong>${escapeHtml(data.nextAppointment)}</strong></div>`
        : ''
    }

    <div class="footer">
      <span>YorPhysio &middot; Your Recovery Partner</span>
      <span>Powered by Clinzor</span>
    </div>
  </body>
</html>`
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
    // 'load' rather than 'networkidle0': every asset is inlined, so there is no
    // network to idle and waiting on it only adds latency.
    await page.setContent(buildHtml(data), { waitUntil: 'load' })
    const pdf = await page.pdf({ format: 'A4', printBackground: true })
    return Buffer.from(pdf)
  } finally {
    await browser.close()
  }
}
