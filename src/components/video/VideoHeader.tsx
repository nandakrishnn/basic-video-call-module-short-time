import { COLORS, RADII } from '@/constants/colors'
import { Logo } from '@/components/shared/Logo'
import type { CallState } from '@/hooks/useJitsiCall'
import { CallTimer } from './CallTimer'

interface VideoHeaderProps {
  patientName: string
  sessionType: string
  formattedTime: string
  callState: CallState
}

const STATE_LABEL: Record<CallState, string> = {
  connecting: 'Connecting…',
  connected: 'Live',
  ended: 'Ended',
}

const STATE_COLOR: Record<CallState, string> = {
  connecting: COLORS.status.warning,
  connected: COLORS.status.success,
  ended: COLORS.status.error,
}

export const VideoHeader = ({ patientName, sessionType, formattedTime, callState }: VideoHeaderProps): JSX.Element => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 20px',
        background: COLORS.glass.dark,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        flexShrink: 0,
        zIndex: 2,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0, overflow: 'hidden' }}>
        <Logo surface="dark" size="sm" />
        <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.2)', flexShrink: 0 }} />
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <span
            style={{
              color: COLORS.text.inverse,
              fontWeight: 700,
              fontSize: '0.9rem',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {patientName}
          </span>
          <span
            style={{
              color: COLORS.text.inverse,
              opacity: 0.7,
              fontSize: '0.78rem',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {sessionType}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 10px',
            borderRadius: RADII.pill,
            background: 'rgba(255,255,255,0.12)',
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: STATE_COLOR[callState],
            }}
          />
          <span style={{ color: COLORS.text.inverse, fontSize: '0.75rem', fontWeight: 600 }}>
            {STATE_LABEL[callState]}
          </span>
        </div>
        <CallTimer formattedTime={formattedTime} />
      </div>
    </div>
  )
}
