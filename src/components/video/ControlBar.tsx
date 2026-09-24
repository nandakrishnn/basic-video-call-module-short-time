import { LayoutGrid, Maximize, Mic, MicOff, Minimize, PhoneOff, Video, VideoOff } from 'lucide-react'
import type { ReactNode } from 'react'
import { COLORS, FONT_SIZES, RADII, SHADOWS } from '@/constants/colors'

interface ControlBarProps {
  isMuted: boolean
  isCameraOff: boolean
  isFullscreen: boolean
  isSplitView: boolean
  onToggleAudio: () => void
  onToggleCamera: () => void
  onToggleFullscreen: () => void
  onToggleSplitView: () => void
  onEndCall: () => void
}

interface ControlProps {
  icon: ReactNode
  label: string
  /** Toggled-off state — mic muted, camera stopped — shown in the danger tone. */
  danger?: boolean
  active?: boolean
  onClick: () => void
}

const Control = ({ icon, label, danger = false, active = false, onClick }: ControlProps): JSX.Element => (
  <button type="button" onClick={onClick} aria-label={label} className="call-control">
    <span
      className="call-control-icon"
      style={{
        background: danger ? COLORS.status.error : active ? COLORS.onDark.border : COLORS.onDark.fill,
        color: COLORS.text.inverse,
      }}
    >
      {icon}
    </span>
    <span style={{ color: COLORS.onDark.strong, fontSize: FONT_SIZES.xs, fontWeight: 600 }}>{label}</span>
  </button>
)

export const ControlBar = ({
  isMuted,
  isCameraOff,
  isFullscreen,
  isSplitView,
  onToggleAudio,
  onToggleCamera,
  onToggleFullscreen,
  onToggleSplitView,
  onEndCall,
}: ControlBarProps): JSX.Element => {
  return (
    <div
      className="call-control-bar"
      style={{
        background: COLORS.video.overlay,
        borderRadius: RADII.xl,
        boxShadow: SHADOWS.lg,
      }}
    >
      <Control
        icon={isMuted ? <MicOff size={19} /> : <Mic size={19} />}
        label={isMuted ? 'Unmute' : 'Mute'}
        danger={isMuted}
        onClick={onToggleAudio}
      />
      <Control
        icon={isCameraOff ? <VideoOff size={19} /> : <Video size={19} />}
        label={isCameraOff ? 'Start Video' : 'Stop Video'}
        danger={isCameraOff}
        onClick={onToggleCamera}
      />
      <Control
        icon={<LayoutGrid size={19} />}
        label={isSplitView ? 'Speaker' : 'Split View'}
        active={isSplitView}
        onClick={onToggleSplitView}
      />
      <Control
        icon={isFullscreen ? <Minimize size={19} /> : <Maximize size={19} />}
        label={isFullscreen ? 'Exit Full' : 'Fullscreen'}
        onClick={onToggleFullscreen}
      />

      <button type="button" onClick={onEndCall} aria-label="End call" className="call-end-button">
        <PhoneOff size={18} />
        End Call
      </button>
    </div>
  )
}
