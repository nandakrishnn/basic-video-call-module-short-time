import { PhoneOff } from 'lucide-react'
import { useRef } from 'react'
import { Button } from '@/components/shared/Button'
import { COLORS, RADII, SHADOWS } from '@/constants/colors'
import { useCallTimer } from '@/hooks/useCallTimer'
import { useFullscreen } from '@/hooks/useFullscreen'
import { useJitsiCall } from '@/hooks/useJitsiCall'
import { ControlBar } from './ControlBar'
import { LobbyRequests } from './LobbyRequests'
import { PoweredByBadge } from './PoweredByBadge'
import { TroubleshootButton } from './TroubleshootButton'
import { VideoHeader } from './VideoHeader'

interface VideoStageProps {
  roomName: string
  displayName: string
  jwt?: string | null
  isModerator?: boolean
  patientName: string
  counterpartName: string
  sessionType: string
  onCallEnded: () => void
}

export const VideoStage = ({
  roomName,
  displayName,
  jwt,
  isModerator,
  patientName,
  counterpartName,
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
    isChatOpen,
    knockingParticipants,
    toggleAudio,
    toggleCamera,
    toggleSplitView,
    toggleChat,
    admitParticipant,
    rejectParticipant,
    endCall,
  } = useJitsiCall({
    roomName,
    displayName,
    jwt,
    isModerator,
    containerRef,
    onCallEnded,
  })
  const { isFullscreen, toggleFullscreen } = useFullscreen(stageRef)
  const formattedTime = useCallTimer(isReady)

  return (
    <div
      ref={stageRef}
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        background: COLORS.primary,
        borderRadius: RADII.md,
        boxShadow: SHADOWS.md,
        overflow: 'hidden',
      }}
    >
      {/* Jitsi's own chat panel takes over the iframe's layout (full-screen on
          mobile, a docked side panel on desktop) — our fixed overlays would
          sit on top of and clash with it, so they hide while chat is open. */}
      {!isChatOpen && (
        <VideoHeader
          patientName={patientName}
          sessionType={sessionType}
          formattedTime={formattedTime}
          callState={callState}
        />
      )}
      {/* Video sits below the header (not underneath it) so Jitsi's own
          overlays — like its participant thumbnail near the top edge —
          never end up hidden behind our header bar. */}
      <div style={{ position: 'relative', flex: 1, minHeight: 0 }}>
        <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
        <TroubleshootButton counterpartName={counterpartName} isChatOpen={isChatOpen} onToggleChat={toggleChat} />
        {isModerator && (
          <LobbyRequests
            participants={knockingParticipants}
            offsetTop={isChatOpen ? 70 : 16}
            onAdmit={admitParticipant}
            onReject={rejectParticipant}
          />
        )}
        {isChatOpen && (
          <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 3 }}>
            <Button
              variant="danger"
              shape="pill"
              size="sm"
              onClick={endCall}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <PhoneOff size={15} />
              End Call
            </Button>
          </div>
        )}
        {!isChatOpen && (
          <>
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
          </>
        )}
      </div>
    </div>
  )
}
