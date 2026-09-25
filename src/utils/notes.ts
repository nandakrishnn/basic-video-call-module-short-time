/**
 * The clinical record's fixed structure. The physio fills these directly rather
 * than writing prose for the AI to sort — the model then only proofreads, and
 * can never mis-file a detail into the wrong section or drop one it couldn't
 * confidently place.
 */
export const NOTE_SECTIONS = [
  {
    key: 'complaint',
    heading: 'PRESENTING COMPLAINT',
    label: 'Presenting complaint',
    hint: 'What the patient came in with today.',
  },
  {
    key: 'treatment',
    heading: 'TREATMENT PROVIDED',
    label: 'Treatment provided',
    hint: 'What you did in this session.',
  },
  {
    key: 'response',
    heading: 'PATIENT RESPONSE',
    label: 'Patient response',
    hint: 'How they responded — pain, range, tolerance.',
  },
  {
    key: 'recommendations',
    heading: 'RECOMMENDATIONS',
    label: 'Recommendations',
    hint: 'Home exercises, precautions, advice.',
  },
  {
    key: 'nextSteps',
    heading: 'NEXT STEPS',
    label: 'Next steps',
    hint: 'Plan for the next session or discharge.',
  },
] as const

export type NoteSectionKey = (typeof NOTE_SECTIONS)[number]['key']
export type NoteFields = Record<NoteSectionKey, string>

export const EMPTY_NOTE_FIELDS: NoteFields = NOTE_SECTIONS.reduce(
  (acc, section) => ({ ...acc, [section.key]: '' }),
  {} as NoteFields,
)

/** Placeholder for a section the physio deliberately left blank. */
export const NOT_DOCUMENTED = 'Not documented.'

/** Fields → the stored/printed record. One format for raw, enhanced and PDF. */
export const composeNotes = (fields: NoteFields): string =>
  NOTE_SECTIONS.map(({ key, heading }) => {
    const value = fields[key].trim()
    return `${heading}:\n${value || NOT_DOCUMENTED}`
  }).join('\n\n')

/**
 * Reads the composed format back into fields, so an enhanced or previously
 * saved record can be edited section by section. Any text before the first
 * heading — a note written in the old free-text flow — is kept in the first
 * section rather than discarded.
 */
export const parseNotes = (text: string): NoteFields => {
  const fields = { ...EMPTY_NOTE_FIELDS }
  if (!text.trim()) return fields

  const headings = NOTE_SECTIONS.map(({ heading }) => heading)
  const pattern = new RegExp(`^(${headings.join('|')}):\\s*$`, 'i')

  let current: NoteSectionKey | null = null
  const buffers: Partial<Record<NoteSectionKey, string[]>> = {}
  const preamble: string[] = []

  for (const line of text.split(/\r?\n/)) {
    const match = line.trim().match(pattern)
    if (match) {
      const found = NOTE_SECTIONS.find((s) => s.heading.toLowerCase() === match[1]?.toLowerCase())
      current = found ? found.key : null
      if (current) buffers[current] = []
      continue
    }
    if (current) buffers[current]?.push(line)
    else preamble.push(line)
  }

  for (const { key } of NOTE_SECTIONS) {
    const value = (buffers[key] ?? []).join('\n').trim()
    fields[key] = value === NOT_DOCUMENTED ? '' : value
  }

  const leading = preamble.join('\n').trim()
  if (leading && !fields.complaint) fields.complaint = leading

  return fields
}

export const hasAnyContent = (fields: NoteFields): boolean =>
  NOTE_SECTIONS.some(({ key }) => fields[key].trim().length > 0)
