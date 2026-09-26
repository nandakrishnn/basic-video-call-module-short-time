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
        // Floor so the stage can never collapse to its content height and
        // stack the absolutely positioned overlays below on top of each other.
        minHeight: 320,
        background: COLORS.accent,
        border: `1px solid ${COLORS.border}`,
        borderRadius: RADII.lg,
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
          onEndCall={endCall}
        />
      )}
      {/* Video sits below the header (not underneath it) so Jitsi's own
          overlays — like its participant thumbnail near the top edge —
          never end up hidden behind our header bar. */}
      <div style={{ position: 'relative', flex: 1, minHeight: 240 }}>
        <div ref={containerRef} style={{ width: '100%', height: '100%', overflow: 'hidden' }} />

        {/* No name or connection pill over the video: the header above already
            shows both, and the name pill sat at the same top-left coordinates
            as the chat button, so the two overlapped. */}
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
        {/* Held back until the conference is actually joined. Before that these
            controls do nothing, and they were covering Jitsi's own connecting
            and permission UI — including its join button — on mobile, where the
            two land in the same corner. The header's End Session stays
            available throughout as the way out. */}
        {!isChatOpen && callState === 'connected' && (
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
