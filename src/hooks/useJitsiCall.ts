import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import { CONFIG } from '@/constants/config'
import { JITSI_CONFIG_OVERWRITE, JITSI_INTERFACE_CONFIG, loadJitsiScript } from '@/lib/jitsi'

interface UseJitsiCallParams {
  roomName: string
  displayName: string
  jwt?: string | null
  containerRef: RefObject<HTMLDivElement>
  onCallEnded?: () => void
}

export type CallState = 'connecting' | 'connected' | 'ended'

interface UseJitsiCallResult {
  isReady: boolean
  callState: CallState
  isMuted: boolean
  isCameraOff: boolean
  isSplitView: boolean
  isChatOpen: boolean
  toggleAudio: () => void
  toggleCamera: () => void
  toggleSplitView: () => void
  toggleChat: () => void
  endCall: () => void
}

export const useJitsiCall = ({
  roomName,
  displayName,
  jwt,
  containerRef,
  onCallEnded,
}: UseJitsiCallParams): UseJitsiCallResult => {
  const apiRef = useRef<JitsiMeetExternalApiInstance | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [callState, setCallState] = useState<CallState>('connecting')
  const [isMuted, setIsMuted] = useState(false)
  const [isCameraOff, setIsCameraOff] = useState(false)
  const [isSplitView, setIsSplitView] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)

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

      api.addListener('videoConferenceJoined', () => setCallState('connected'))
      api.addListener('videoConferenceLeft', () => {
        setCallState('ended')
        onCallEnded?.()
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

      apiRef.current = api
      setIsReady(true)
    })

    return () => {
      disposed = true
      apiRef.current?.dispose()
      apiRef.current = null
    }
  }, [roomName, displayName, jwt, containerRef, onCallEnded])

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
    toggleAudio,
    toggleCamera,
    toggleSplitView,
    toggleChat,
    endCall,
  }
}
