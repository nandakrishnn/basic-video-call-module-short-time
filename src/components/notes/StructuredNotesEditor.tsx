import { Check } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { Button } from '@/components/shared/Button'
import { Textarea } from '@/components/shared/Input'
import { COLORS, FONT_SIZES, RADII } from '@/constants/colors'
import { CONFIG } from '@/constants/config'
import { MESSAGES } from '@/constants/messages'
import { NOTE_SECTIONS, hasAnyContent, type NoteFields, type NoteSectionKey } from '@/utils/notes'

interface StructuredNotesEditorProps {
  fields: NoteFields
  onChange: (key: NoteSectionKey, value: string) => void
  onAutoSave: () => void
  /** Proofreads in place — the corrected text replaces what is in the fields. */
  onProofread: () => void
  onContinue: () => void
  isProofreading: boolean
  isSaving: boolean
  /** True once a proofread has been applied, so the physio knows to re-read. */
  hasProofread: boolean
}

export const StructuredNotesEditor = ({
  fields,
  onChange,
  onAutoSave,
  onProofread,
  onContinue,
  isProofreading,
  isSaving,
  hasProofread,
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

  // An entirely blank note is not a clinical record, so both actions stay shut
  // until something is written. The caption below says so — silently dead
  // buttons beside a caption promising blanks are fine just read as broken.
  const isEmpty = !hasAnyContent(fields)
  const isBusy = isProofreading || isSaving
  const isDisabled = isEmpty || isBusy

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <p style={{ color: COLORS.text.secondary, fontSize: FONT_SIZES.base, margin: 0 }}>
        {MESSAGES.notes.structuredHint}
      </p>

      {hasProofread && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 9,
            padding: '11px 14px',
            borderRadius: RADII.sm,
            background: COLORS.statusSoft.success,
            color: COLORS.status.success,
            fontSize: FONT_SIZES.base,
            fontWeight: 600,
          }}
          role="status"
        >
          <Check size={16} />
          {MESSAGES.notes.proofreadApplied}
        </div>
      )}

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
        <span
          style={{
            color: isEmpty ? COLORS.status.warning : COLORS.text.muted,
            fontSize: FONT_SIZES.sm,
            fontWeight: isEmpty ? 600 : 400,
          }}
        >
          {isEmpty ? MESSAGES.notes.needsOneSection : MESSAGES.notes.blankSectionsNote}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <Button variant="secondary" disabled={isDisabled} isLoading={isProofreading} onClick={onProofread}>
            {isProofreading ? MESSAGES.notes.proofreading : MESSAGES.notes.proofreadAction}
          </Button>
          <Button variant="primary" disabled={isDisabled} isLoading={isSaving} onClick={onContinue}>
            {isSaving ? MESSAGES.notes.saving : MESSAGES.notes.continueAction}
          </Button>
        </div>
      </div>
    </div>
  )
}
