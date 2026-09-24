import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import { CONFIG } from '@/constants/config'
import { JITSI_CONFIG_OVERWRITE, JITSI_INTERFACE_CONFIG, loadJitsiScript } from '@/lib/jitsi'

interface UseJitsiCallParams {
  roomName: string
  displayName: string
  jwt?: string | null
  isModerator?: boolean
  containerRef: RefObject<HTMLDivElement>
  onCallEnded?: () => void
}

export type CallState = 'connecting' | 'connected' | 'ended'

export interface KnockingParticipant {
  id: string
  name: string
}

interface UseJitsiCallResult {
  isReady: boolean
  callState: CallState
  isMuted: boolean
  isCameraOff: boolean
  isSplitView: boolean
  isChatOpen: boolean
  knockingParticipants: KnockingParticipant[]
  toggleAudio: () => void
  toggleCamera: () => void
  toggleSplitView: () => void
  toggleChat: () => void
  admitParticipant: (id: string) => void
  rejectParticipant: (id: string) => void
  endCall: () => void
}

export const useJitsiCall = ({
  roomName,
  displayName,
  jwt,
  isModerator = false,
  containerRef,
  onCallEnded,
}: UseJitsiCallParams): UseJitsiCallResult => {
  const apiRef = useRef<JitsiMeetExternalApiInstance | null>(null)

  // Held in a ref and deliberately kept out of the effect's dependencies.
  // Callers pass an inline arrow, so its identity changes on every parent
  // render — as a dependency it would dispose the live call and rebuild the
  // iframe each time, dropping the participant back to "Connecting…".
  const onCallEndedRef = useRef(onCallEnded)
  useEffect(() => {
    onCallEndedRef.current = onCallEnded
  }, [onCallEnded])

  const [isReady, setIsReady] = useState(false)
  const [callState, setCallState] = useState<CallState>('connecting')
  const [isMuted, setIsMuted] = useState(false)
  const [isCameraOff, setIsCameraOff] = useState(false)
  const [isSplitView, setIsSplitView] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [knockingParticipants, setKnockingParticipants] = useState<KnockingParticipant[]>([])

  useEffect(() => {
    let disposed = false

    loadJitsiScript().then(() => {
      if (disposed || !containerRef.current || !window.JitsiMeetExternalAPI) return

      const api = new window.JitsiMeetExternalAPI(CONFIG.jitsi.domain, {
        roomName,
        parentNode: containerRef.current,
        width: '100%',
        height: '100%',
        userInfo: { displayName },
        interfaceConfigOverwrite: JITSI_INTERFACE_CONFIG,
        configOverwrite: JITSI_CONFIG_OVERWRITE,
        ...(jwt ? { jwt } : {}),
      })

      api.addListener('videoConferenceJoined', () => {
        setCallState('connected')
        // Locks the room via Jitsi's native Lobby — only the moderator (the
        // physio, who is always first to actually join since patients wait
        // on our own gate until the session is active) can enable it, so
        // anyone joining after this is held for explicit admission.
        if (isModerator) {
          apiRef.current?.executeCommand('toggleLobby', true)
        }
      })
      api.addListener('videoConferenceLeft', () => {
        setCallState('ended')
        onCallEndedRef.current?.()
      })
      api.addListener('audioMuteStatusChanged', (...args: unknown[]) => {
        const payload = args[0] as { muted?: boolean } | undefined
        if (payload && typeof payload.muted === 'boolean') setIsMuted(payload.muted)
      })
      api.addListener('videoMuteStatusChanged', (...args: unknown[]) => {
        const payload = args[0] as { muted?: boolean } | undefined
        if (payload && typeof payload.muted === 'boolean') setIsCameraOff(payload.muted)
      })
      api.addListener('tileViewChanged', (...args: unknown[]) => {
        const payload = args[0] as { enabled?: boolean } | undefined
        if (payload && typeof payload.enabled === 'boolean') setIsSplitView(payload.enabled)
      })
      // Tracks Jitsi's own chat panel state directly (rather than a locally
      // toggled flag) so we stay in sync even if the user closes it from
      // Jitsi's own chat header instead of our button.
      api.addListener('chatUpdated', (...args: unknown[]) => {
        const payload = args[0] as { isOpen?: boolean } | undefined
        if (payload && typeof payload.isOpen === 'boolean') setIsChatOpen(payload.isOpen)
      })
      api.addListener('knockingParticipant', (...args: unknown[]) => {
        const payload = args[0] as { participant?: { id: string; name: string } } | undefined
        const participant = payload?.participant
        if (!participant) return
        setKnockingParticipants((prev) =>
          prev.some((p) => p.id === participant.id) ? prev : [...prev, participant],
        )
      })

      apiRef.current = api
      setIsReady(true)
    })

    return () => {
      disposed = true
      apiRef.current?.dispose()
      apiRef.current = null
    }
    // containerRef is a stable ref object and onCallEnded is read through a ref,
    // so only a genuine change of room or identity may rebuild the call.
  }, [roomName, displayName, jwt, isModerator, containerRef])

  const toggleAudio = useCallback(() => {
    apiRef.current?.executeCommand('toggleAudio')
  }, [])

  const toggleCamera = useCallback(() => {
    apiRef.current?.executeCommand('toggleVideo')
  }, [])

  const toggleSplitView = useCallback(() => {
    apiRef.current?.executeCommand('toggleTileView')
  }, [])

  const toggleChat = useCallback(() => {
    apiRef.current?.executeCommand('toggleChat')
  }, [])

  const admitParticipant = useCallback((id: string) => {
    apiRef.current?.executeCommand('answerKnockingParticipant', id, true)
    setKnockingParticipants((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const rejectParticipant = useCallback((id: string) => {
    apiRef.current?.executeCommand('answerKnockingParticipant', id, false)
    setKnockingParticipants((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const endCall = useCallback(() => {
    apiRef.current?.executeCommand('hangup')
  }, [])

  return {
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
  }
}
