import { useCallback, useEffect, useState, type RefObject } from 'react'

export const useFullscreen = (
  containerRef: RefObject<HTMLElement>,
): { isFullscreen: boolean; toggleFullscreen: () => void } => {
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const handleChange = (): void => {
      setIsFullscreen(document.fullscreenElement === containerRef.current)
    }
    document.addEventListener('fullscreenchange', handleChange)
    return () => document.removeEventListener('fullscreenchange', handleChange)
  }, [containerRef])

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      void document.exitFullscreen()
    } else {
      void containerRef.current?.requestFullscreen()
    }
  }, [containerRef])

  return { isFullscreen, toggleFullscreen }
}
