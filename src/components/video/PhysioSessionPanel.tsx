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
    <aside
      style={{
        width: 280,
        background: COLORS.surface,
        borderRadius: 16,
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <div>
        <h3 style={{ color: COLORS.text.primary, fontSize: '1rem', fontWeight: 800, margin: 0 }}>
          {patientName}
        </h3>
        {patientAge !== null && (
          <p style={{ color: COLORS.text.secondary, fontSize: '0.85rem', margin: '4px 0 0' }}>
            Age {patientAge}
          </p>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ color: COLORS.text.muted, fontSize: '0.75rem', textTransform: 'uppercase' }}>
          Session
        </span>
        <span style={{ color: COLORS.text.primary, fontSize: '0.9rem', fontWeight: 600 }}>
          Follow-up #{sessionNumber}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ color: COLORS.text.muted, fontSize: '0.75rem', textTransform: 'uppercase' }}>
          Scheduled
        </span>
        <span style={{ color: COLORS.text.secondary, fontSize: '0.85rem' }}>{scheduledAt}</span>
        {actualStartAt && (
          <span style={{ color: COLORS.text.secondary, fontSize: '0.85rem' }}>Started: {actualStartAt}</span>
        )}
      </div>

      <button
        type="button"
        onClick={onQuickNote}
        style={{
          padding: '10px 16px',
          borderRadius: 10,
          border: `1px solid ${COLORS.border}`,
          background: COLORS.background,
          color: COLORS.text.primary,
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Quick Note
      </button>

      <button
        type="button"
        onClick={onEndCallAndWriteNotes}
        style={{
          padding: '10px 16px',
          borderRadius: 10,
          border: 'none',
          background: COLORS.primary,
          color: COLORS.text.inverse,
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        End Call & Write Notes
      </button>
    </aside>
  )
}
