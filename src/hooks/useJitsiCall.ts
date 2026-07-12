import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import { CONFIG } from '@/constants/config'
import { JITSI_CONFIG_OVERWRITE, JITSI_INTERFACE_CONFIG, loadJitsiScript } from '@/lib/jitsi'

interface UseJitsiCallParams {
  roomName: string
  displayName: string
  containerRef: RefObject<HTMLDivElement>
  onCallEnded?: () => void
}

interface UseJitsiCallResult {
  isReady: boolean
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

      api.addListener('videoConferenceLeft', () => onCallEnded?.())
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
    setIsMuted((prev) => !prev)
  }, [])

  const toggleCamera = useCallback(() => {
    apiRef.current?.executeCommand('toggleVideo')
    setIsCameraOff((prev) => !prev)
  }, [])

  const endCall = useCallback(() => {
    apiRef.current?.executeCommand('hangup')
  }, [])

  return { isReady, isMuted, isCameraOff, toggleAudio, toggleCamera, endCall }
}
