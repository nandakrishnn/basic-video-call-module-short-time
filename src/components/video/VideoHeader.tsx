import { COLORS } from '@/constants/colors'
import { CallTimer } from './CallTimer'

interface VideoHeaderProps {
  patientName: string
  sessionType: string
  formattedTime: string
}

export const VideoHeader = ({ patientName, sessionType, formattedTime }: VideoHeaderProps): JSX.Element => {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 20px',
        background: COLORS.video.overlay,
        zIndex: 2,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ color: COLORS.text.inverse, fontWeight: 800, fontSize: '0.95rem' }}>Clinzor</span>
        <span style={{ color: COLORS.text.inverse, opacity: 0.75, fontSize: '0.78rem' }}>
          {patientName} · {sessionType}
        </span>
      </div>
      <CallTimer formattedTime={formattedTime} />
    </div>
  )
}
