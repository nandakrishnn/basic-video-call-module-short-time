import { useEffect, useRef } from 'react'
import { Button } from '@/components/shared/Button'
import { Textarea } from '@/components/shared/Input'
import { COLORS, FONT_SIZES } from '@/constants/colors'
import { CONFIG } from '@/constants/config'
import { MESSAGES } from '@/constants/messages'
import { NOTE_SECTIONS, hasAnyContent, type NoteFields, type NoteSectionKey } from '@/utils/notes'

interface StructuredNotesEditorProps {
  fields: NoteFields
  onChange: (key: NoteSectionKey, value: string) => void
  onAutoSave: () => void
  onSubmit: () => void
  /** Save without the proofreading pass. */
  onSkip: () => void
  isSubmitting: boolean
}

export const StructuredNotesEditor = ({
  fields,
  onChange,
  onAutoSave,
  onSubmit,
  onSkip,
  isSubmitting,
}: StructuredNotesEditorProps): JSX.Element => {
  const savedRef = useRef(JSON.stringify(fields))

  useEffect(() => {
    const interval = setInterval(() => {
      const snapshot = JSON.stringify(fields)
      if (snapshot !== savedRef.current && hasAnyContent(fields)) {
        onAutoSave()
        savedRef.current = snapshot
      }
    }, CONFIG.session.autoSaveDraftIntervalSeconds * 1000)

    return () => clearInterval(interval)
  }, [fields, onAutoSave])

  const isDisabled = !hasAnyContent(fields) || isSubmitting

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <p style={{ color: COLORS.text.secondary, fontSize: FONT_SIZES.base, margin: 0 }}>
        {MESSAGES.notes.structuredHint}
      </p>

      {NOTE_SECTIONS.map(({ key, label, hint }) => (
        <label key={key} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ color: COLORS.text.primary, fontSize: FONT_SIZES.base, fontWeight: 700 }}>{label}</span>
          <span style={{ color: COLORS.text.muted, fontSize: FONT_SIZES.sm }}>{hint}</span>
          <Textarea
            value={fields[key]}
            onChange={(e) => onChange(key, e.target.value)}
            rows={3}
            style={{ fontSize: FONT_SIZES.md, lineHeight: 1.6 }}
          />
        </label>
      ))}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        {/* Blank sections are recorded as "Not documented" — a deliberate
            omission by the physio, not the model failing to find something. */}
        <span style={{ color: COLORS.text.muted, fontSize: FONT_SIZES.sm }}>
          {MESSAGES.notes.blankSectionsNote}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <Button variant="secondary" disabled={isDisabled} onClick={onSkip}>
            {MESSAGES.notes.skipAi}
          </Button>
          <Button variant="primary" disabled={isDisabled} isLoading={isSubmitting} onClick={onSubmit}>
            {isSubmitting ? MESSAGES.notes.enhancing : MESSAGES.notes.proofreadAction}
          </Button>
        </div>
      </div>
    </div>
  )
}
