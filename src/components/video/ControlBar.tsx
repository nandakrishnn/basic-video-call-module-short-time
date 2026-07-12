import type { CSSProperties } from 'react'
import { COLORS } from '@/constants/colors'

interface ControlBarProps {
  isMuted: boolean
  isCameraOff: boolean
  onToggleAudio: () => void
  onToggleCamera: () => void
  onEndCall: () => void
}

const buttonStyle = (active: boolean): CSSProperties => ({
  width: 48,
  height: 48,
  borderRadius: '50%',
  border: 'none',
  background: active ? COLORS.status.error : COLORS.video.controls,
  color: COLORS.video.controlsText,
  cursor: 'pointer',
  fontSize: '0.75rem',
  fontWeight: 700,
})

export const ControlBar = ({
  isMuted,
  isCameraOff,
  onToggleAudio,
  onToggleCamera,
  onEndCall,
}: ControlBarProps): JSX.Element => {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: 16,
        zIndex: 2,
      }}
    >
      <button type="button" onClick={onToggleAudio} style={buttonStyle(isMuted)} aria-label="Toggle microphone">
        {isMuted ? 'Unmute' : 'Mute'}
      </button>
      <button type="button" onClick={onToggleCamera} style={buttonStyle(isCameraOff)} aria-label="Toggle camera">
        {isCameraOff ? 'Camera On' : 'Camera Off'}
      </button>
      <button
        type="button"
        onClick={onEndCall}
        style={{ ...buttonStyle(true), width: 'auto', padding: '0 20px', borderRadius: 24 }}
        aria-label="End call"
      >
        End Call
      </button>
    </div>
  )
}
