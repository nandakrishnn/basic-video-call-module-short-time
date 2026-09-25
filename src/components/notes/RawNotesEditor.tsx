import { useEffect, useRef } from 'react'
import { Button } from '@/components/shared/Button'
import { Textarea } from '@/components/shared/Input'
import { COLORS } from '@/constants/colors'
import { CONFIG } from '@/constants/config'
import { MESSAGES } from '@/constants/messages'

interface RawNotesEditorProps {
  value: string
  onChange: (value: string) => void
  onAutoSave: (value: string) => void
  onSubmit: () => void
  /** Carry the raw notes straight through, bypassing the AI step entirely. */
  onSkip: () => void
  isSubmitting: boolean
}

export const RawNotesEditor = ({
  value,
  onChange,
  onAutoSave,
  onSubmit,
  onSkip,
  isSubmitting,
}: RawNotesEditorProps): JSX.Element => {
  const lastSavedRef = useRef(value)

  useEffect(() => {
    const interval = setInterval(() => {
      if (value !== lastSavedRef.current && value.trim().length > 0) {
        onAutoSave(value)
        lastSavedRef.current = value
      }
    }, CONFIG.session.autoSaveDraftIntervalSeconds * 1000)

    return () => clearInterval(interval)
  }, [value, onAutoSave])

  const isDisabled = value.trim().length === 0 || isSubmitting

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={MESSAGES.notes.rawPlaceholder}
        rows={12}
        style={{ fontSize: '0.92rem', lineHeight: 1.6 }}
      />
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <span style={{ color: COLORS.text.muted, fontSize: '0.78rem' }}>{value.length} characters</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Always available, not just after a failure — the AI is a
              convenience, and a physio must never be blocked from filing
              notes because a third-party model is unavailable. */}
          <Button variant="secondary" disabled={isDisabled} onClick={onSkip}>
            {MESSAGES.notes.skipAi}
          </Button>
          <Button variant="primary" disabled={isDisabled} isLoading={isSubmitting} onClick={onSubmit}>
            {isSubmitting ? MESSAGES.notes.enhancing : MESSAGES.notes.enhanceAction}
          </Button>
        </div>
      </div>
    </div>
  )
}
