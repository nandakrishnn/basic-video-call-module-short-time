import type { CSSProperties } from 'react'
import { COLORS } from '@/constants/colors'

interface EnhancedNotesPanelProps {
  rawNotes: string
  enhancedNotes: string
  onEnhancedChange: (value: string) => void
  onApprove: () => void
  isSaving: boolean
}

const columnStyle: CSSProperties = { flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }
const labelStyle: CSSProperties = {
  fontSize: '0.75rem',
  fontWeight: 700,
  color: COLORS.text.muted,
  textTransform: 'uppercase',
}
const boxStyle: CSSProperties = {
  padding: '14px 16px',
  borderRadius: 12,
  border: `1px solid ${COLORS.border}`,
  fontSize: '0.88rem',
  lineHeight: 1.6,
  minHeight: 320,
}

export const EnhancedNotesPanel = ({
  rawNotes,
  enhancedNotes,
  onEnhancedChange,
  onApprove,
  isSaving,
}: EnhancedNotesPanelProps): JSX.Element => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 16 }}>
        <div style={columnStyle}>
          <span style={labelStyle}>Raw notes</span>
          <div
            style={{
              ...boxStyle,
              background: COLORS.background,
              color: COLORS.text.secondary,
              whiteSpace: 'pre-wrap',
            }}
          >
            {rawNotes}
          </div>
        </div>
        <div style={columnStyle}>
          <span style={labelStyle}>Enhanced notes</span>
          <textarea
            value={enhancedNotes}
            onChange={(e) => onEnhancedChange(e.target.value)}
            style={{ ...boxStyle, color: COLORS.text.primary, resize: 'vertical' }}
          />
        </div>
      </div>
      <button
        type="button"
        disabled={isSaving}
        onClick={onApprove}
        style={{
          alignSelf: 'flex-end',
          padding: '10px 24px',
          borderRadius: 10,
          border: 'none',
          background: COLORS.status.success,
          color: COLORS.text.inverse,
          fontWeight: 700,
          cursor: isSaving ? 'default' : 'pointer',
          opacity: isSaving ? 0.6 : 1,
        }}
      >
        {isSaving ? 'Saving…' : 'Approve & Save'}
      </button>
    </div>
  )
}
