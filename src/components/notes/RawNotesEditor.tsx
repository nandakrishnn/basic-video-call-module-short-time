import { useEffect, useRef } from 'react'
import { COLORS } from '@/constants/colors'
import { CONFIG } from '@/constants/config'
import { MESSAGES } from '@/constants/messages'

interface RawNotesEditorProps {
  value: string
  onChange: (value: string) => void
  onAutoSave: (value: string) => void
  onSubmit: () => void
  isSubmitting: boolean
}

export const RawNotesEditor = ({
  value,
  onChange,
  onAutoSave,
  onSubmit,
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={MESSAGES.notes.rawPlaceholder}
        rows={12}
        style={{
          padding: '14px 16px',
          borderRadius: 12,
          border: `1px solid ${COLORS.border}`,
          fontSize: '0.92rem',
          lineHeight: 1.6,
          color: COLORS.text.primary,
          resize: 'vertical',
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: COLORS.text.muted, fontSize: '0.78rem' }}>{value.length} characters</span>
        <button
          type="button"
          disabled={isDisabled}
          onClick={onSubmit}
          style={{
            padding: '10px 20px',
            borderRadius: 10,
            border: 'none',
            background: COLORS.primary,
            color: COLORS.text.inverse,
            fontWeight: 700,
            cursor: isDisabled ? 'default' : 'pointer',
            opacity: isDisabled ? 0.6 : 1,
          }}
        >
          {isSubmitting ? 'Enhancing…' : 'Enhance with AI'}
        </button>
      </div>
    </div>
  )
}
