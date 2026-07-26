import { useRef } from 'react'
import { COLORS, RADII, SHADOWS } from '@/constants/colors'
import { useCallTimer } from '@/hooks/useCallTimer'
import { useFullscreen } from '@/hooks/useFullscreen'
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
  const stageRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const {
    isReady,
    callState,
    isMuted,
    isCameraOff,
    isSplitView,
    toggleAudio,
    toggleCamera,
    toggleSplitView,
    endCall,
  } = useJitsiCall({
    roomName,
    displayName,
    jwt,
    containerRef,
    onCallEnded,
  })
  const { isFullscreen, toggleFullscreen } = useFullscreen(stageRef)
  const formattedTime = useCallTimer(isReady)

  return (
    <div
      ref={stageRef}
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
        isFullscreen={isFullscreen}
        isSplitView={isSplitView}
        onToggleAudio={toggleAudio}
        onToggleCamera={toggleCamera}
        onToggleFullscreen={toggleFullscreen}
        onToggleSplitView={toggleSplitView}
        onEndCall={endCall}
      />
      <PoweredByBadge />
    </div>
  )
}
