import { Mic, MicOff, PhoneOff, Video, VideoOff } from 'lucide-react'
import { Button } from '@/components/shared/Button'
import { IconButton } from '@/components/shared/IconButton'

interface ControlBarProps {
  isMuted: boolean
  isCameraOff: boolean
  onToggleAudio: () => void
  onToggleCamera: () => void
  onEndCall: () => void
}

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
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        zIndex: 2,
      }}
    >
      <IconButton
        icon={isMuted ? <MicOff size={20} /> : <Mic size={20} />}
        active={isMuted}
        onClick={onToggleAudio}
        aria-label="Toggle microphone"
      />
      <IconButton
        icon={isCameraOff ? <VideoOff size={20} /> : <Video size={20} />}
        active={isCameraOff}
        onClick={onToggleCamera}
        aria-label="Toggle camera"
      />
      <Button variant="danger" shape="pill" onClick={onEndCall} aria-label="End call">
        <PhoneOff size={18} />
        End Call
      </Button>
    </div>
  )
}
