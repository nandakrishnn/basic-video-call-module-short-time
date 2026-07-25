import { useRef } from 'react'
import { COLORS, RADII, SHADOWS } from '@/constants/colors'
import { useCallTimer } from '@/hooks/useCallTimer'
import { useJitsiCall } from '@/hooks/useJitsiCall'
import { ControlBar } from './ControlBar'
import { PoweredByBadge } from './PoweredByBadge'
import { VideoHeader } from './VideoHeader'

interface VideoStageProps {
  roomName: string
  displayName: string
  jwt?: string | null
  patientName: string
  sessionType: string
  onCallEnded: () => void
}

export const VideoStage = ({
  roomName,
  displayName,
  jwt,
  patientName,
  sessionType,
  onCallEnded,
}: VideoStageProps): JSX.Element => {
  const containerRef = useRef<HTMLDivElement>(null)
  const { isReady, callState, isMuted, isCameraOff, toggleAudio, toggleCamera, endCall } = useJitsiCall({
    roomName,
    displayName,
    jwt,
    containerRef,
    onCallEnded,
  })
  const formattedTime = useCallTimer(isReady)

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: COLORS.primary,
        borderRadius: RADII.md,
        boxShadow: SHADOWS.md,
        overflow: 'hidden',
      }}
    >
      <VideoHeader
        patientName={patientName}
        sessionType={sessionType}
        formattedTime={formattedTime}
        callState={callState}
      />
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      <ControlBar
        isMuted={isMuted}
        isCameraOff={isCameraOff}
        onToggleAudio={toggleAudio}
        onToggleCamera={toggleCamera}
        onEndCall={endCall}
      />
      <PoweredByBadge />
    </div>
  )
}
