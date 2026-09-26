import { ArrowRight, Clock, SignalHigh } from 'lucide-react'
import { Logo } from '@/components/shared/Logo'
import { COLORS, FONT_SIZES, RADII } from '@/constants/colors'
import type { CallState } from '@/hooks/useJitsiCall'
import { CallTimer } from './CallTimer'

interface VideoHeaderProps {
  patientName: string
  sessionType: string
  formattedTime: string
  callState: CallState
  /** Same hangup the control bar uses — surfaced here to match the reference. */
  onEndCall?: () => void
}

const STATE_LABEL: Record<CallState, string> = {
  connecting: 'Connecting…',
  connected: 'Good Connection',
  ended: 'Ended',
}

const STATE_COLOR: Record<CallState, string> = {
  connecting: COLORS.status.warning,
  connected: COLORS.status.success,
  ended: COLORS.status.error,
}

export const VideoHeader = ({
  patientName,
  sessionType,
  formattedTime,
  callState,
  onEndCall,
}: VideoHeaderProps): JSX.Element => {
  return (
    <div
      className="video-header"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        padding: '14px 22px',
        background: COLORS.surface,
        borderBottom: `1px solid ${COLORS.border}`,
        flexShrink: 0,
        zIndex: 2,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 0, overflow: 'hidden' }}>
        <Logo surface="light" size="sm" showWordmark />
        <div style={{ width: 1, height: 30, background: COLORS.border, flexShrink: 0 }} />
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <span
            style={{
              color: COLORS.text.primary,
              fontWeight: 700,
              fontSize: FONT_SIZES.md,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {patientName}
          </span>
          <span
            style={{
              color: COLORS.text.secondary,
              fontSize: FONT_SIZES.sm,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {sessionType}
          </span>
        </div>
      </div>

      <div className="video-header-meta">
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
          <Clock size={16} color={COLORS.text.secondary} />
          <CallTimer formattedTime={formattedTime} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
          <SignalHigh size={17} color={STATE_COLOR[callState]} />
          <span
            className="vh-conn-label"
            style={{ color: COLORS.text.secondary, fontSize: FONT_SIZES.base, fontWeight: 600 }}
          >
            {STATE_LABEL[callState]}
          </span>
        </div>

        {onEndCall && (
          <>
            <div style={{ width: 1, height: 26, background: COLORS.border, flexShrink: 0 }} />
            <button
              type="button"
              onClick={onEndCall}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 9,
                padding: '11px 20px',
                border: 'none',
                borderRadius: RADII.md,
                background: COLORS.primarySoft,
                color: COLORS.primaryStrong,
                fontFamily: 'inherit',
                fontSize: FONT_SIZES.base,
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {/* Shortened rather than dropped on narrow screens — it is the
                  only way out of the call while connecting. */}
              <span className="vh-end-long">End Session</span>
              <span className="vh-end-short">End</span>
              <ArrowRight size={16} />
            </button>
          </>
        )}
      </div>
    </div>
  )
}
