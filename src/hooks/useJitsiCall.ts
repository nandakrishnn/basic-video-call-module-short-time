import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import { CONFIG } from '@/constants/config'
import { JITSI_CONFIG_OVERWRITE, JITSI_INTERFACE_CONFIG, loadJitsiScript } from '@/lib/jitsi'

interface UseJitsiCallParams {
  roomName: string
  displayName: string
  containerRef: RefObject<HTMLDivElement>
  onCallEnded?: () => void
}

export type CallState = 'connecting' | 'connected' | 'ended'

interface UseJitsiCallResult {
  isReady: boolean
  callState: CallState
  isMuted: boolean
  isCameraOff: boolean
  toggleAudio: () => void
  toggleCamera: () => void
  endCall: () => void
}

export const useJitsiCall = ({
  roomName,
  displayName,
  containerRef,
  onCallEnded,
}: UseJitsiCallParams): UseJitsiCallResult => {
  const apiRef = useRef<JitsiMeetExternalApiInstance | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [callState, setCallState] = useState<CallState>('connecting')
  const [isMuted, setIsMuted] = useState(false)
  const [isCameraOff, setIsCameraOff] = useState(false)

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

      apiRef.current = api
      setIsReady(true)
    })

    return () => {
      disposed = true
      apiRef.current?.dispose()
      apiRef.current = null
    }
  }, [roomName, displayName, containerRef, onCallEnded])

  const toggleAudio = useCallback(() => {
    apiRef.current?.executeCommand('toggleAudio')
  }, [])

  const toggleCamera = useCallback(() => {
    apiRef.current?.executeCommand('toggleVideo')
  }, [])

  const endCall = useCallback(() => {
    apiRef.current?.executeCommand('hangup')
  }, [])

  return { isReady, callState, isMuted, isCameraOff, toggleAudio, toggleCamera, endCall }
}
