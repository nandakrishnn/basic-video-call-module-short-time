import { Card } from '@/components/shared/Card'
import { Button } from '@/components/shared/Button'
import { COLORS } from '@/constants/colors'

interface PhysioSessionPanelProps {
  patientName: string
  patientAge: number | null
  sessionNumber: number
  scheduledAt: string
  actualStartAt: string | null
  onQuickNote: () => void
  onEndCallAndWriteNotes: () => void
}

export const PhysioSessionPanel = ({
  patientName,
  patientAge,
  sessionNumber,
  scheduledAt,
  actualStartAt,
  onQuickNote,
  onEndCallAndWriteNotes,
}: PhysioSessionPanelProps): JSX.Element => {
  return (
    <Card
      elevation="md"
      style={{ width: 280, display: 'flex', flexDirection: 'column', gap: 20 }}
    >
      <div>
        <h3 style={{ color: COLORS.text.primary, fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>
          {patientName}
        </h3>
        {patientAge !== null && (
          <p style={{ color: COLORS.text.secondary, fontSize: '0.85rem', margin: '4px 0 0' }}>
            Age {patientAge}
          </p>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ color: COLORS.text.muted, fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4 }}>
          Session
        </span>
        <span style={{ color: COLORS.text.primary, fontSize: '0.9rem', fontWeight: 600 }}>
          Follow-up #{sessionNumber}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ color: COLORS.text.muted, fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4 }}>
          Scheduled
        </span>
        <span style={{ color: COLORS.text.secondary, fontSize: '0.85rem' }}>{scheduledAt}</span>
        {actualStartAt && (
          <span style={{ color: COLORS.text.secondary, fontSize: '0.85rem' }}>Started: {actualStartAt}</span>
        )}
      </div>

      <Button variant="secondary" onClick={onQuickNote} fullWidth>
        Quick Note
      </Button>

      <Button variant="primary" onClick={onEndCallAndWriteNotes} fullWidth>
        End Call &amp; Write Notes
      </Button>
    </Card>
  )
}
