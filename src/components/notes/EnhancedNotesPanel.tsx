import type { CSSProperties } from 'react'
import { Button } from '@/components/shared/Button'
import { Textarea } from '@/components/shared/Input'
import { COLORS, RADII } from '@/constants/colors'

interface EnhancedNotesPanelProps {
  rawNotes: string
  enhancedNotes: string
  onEnhancedChange: (value: string) => void
  onApprove: () => void
  isSaving: boolean
}

const columnStyle: CSSProperties = { flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }
const labelStyle: CSSProperties = {
  fontSize: '0.72rem',
  fontWeight: 600,
  color: COLORS.text.muted,
  textTransform: 'uppercase',
  letterSpacing: 0.4,
}
const boxStyle: CSSProperties = {
  padding: '14px 16px',
  borderRadius: RADII.sm,
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
      <div className="notes-columns">
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
          <Textarea
            value={enhancedNotes}
            onChange={(e) => onEnhancedChange(e.target.value)}
            style={{ ...boxStyle, resize: 'vertical' }}
          />
        </div>
      </div>
      <Button
        variant="primary"
        isLoading={isSaving}
        onClick={onApprove}
        style={{ alignSelf: 'flex-end', background: COLORS.status.success }}
      >
        {isSaving ? 'Saving…' : 'Approve & Save'}
      </Button>
    </div>
  )
}
