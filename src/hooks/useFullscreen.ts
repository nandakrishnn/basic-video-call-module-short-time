import { useCallback, useEffect, useState, type CSSProperties, type RefObject } from 'react'

/** Safari still exposes the Fullscreen API under its webkit prefix. */
interface WebkitFullscreenElement extends HTMLElement {
  webkitRequestFullscreen?: () => Promise<void> | void
}
interface WebkitFullscreenDocument extends Document {
  webkitFullscreenElement?: Element | null
  webkitExitFullscreen?: () => Promise<void> | void
}

const doc = (): WebkitFullscreenDocument => document as WebkitFullscreenDocument

const currentFullscreenElement = (): Element | null =>
  document.fullscreenElement ?? doc().webkitFullscreenElement ?? null

/**
 * Fills the viewport without the Fullscreen API. dvh rather than vh so iOS
 * Safari's collapsing toolbars don't leave the stage taller than what is
 * actually visible.
 */
const FALLBACK_STYLE: CSSProperties = {
  position: 'fixed',
  inset: 0,
  width: '100vw',
  height: '100dvh',
  maxWidth: '100vw',
  zIndex: 1000,
  borderRadius: 0,
  border: 'none',
}

interface UseFullscreenResult {
  isFullscreen: boolean
  toggleFullscreen: () => void
  /** Spread onto the element; empty unless the CSS fallback is in use. */
  fallbackStyle: CSSProperties
}

/**
 * Fullscreen for the call stage, on every browser.
 *
 * iPhone Safari implements the Fullscreen API on <video> elements only, and
 * Jitsi's video lives inside a cross-origin iframe we cannot reach into — so
 * there is no native fullscreen to ask for there, and the button did nothing.
 * Where the API is missing we fill the viewport with CSS instead, which gets
 * the same result everywhere: the browser's own chrome stays, nothing else does.
 */
export const useFullscreen = (containerRef: RefObject<HTMLElement>): UseFullscreenResult => {
  const [isNativeFullscreen, setIsNativeFullscreen] = useState(false)
  const [isFallbackFullscreen, setIsFallbackFullscreen] = useState(false)

  useEffect(() => {
    const handleChange = (): void => {
      setIsNativeFullscreen(currentFullscreenElement() === containerRef.current)
    }
    document.addEventListener('fullscreenchange', handleChange)
    document.addEventListener('webkitfullscreenchange', handleChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleChange)
      document.removeEventListener('webkitfullscreenchange', handleChange)
    }
  }, [containerRef])

  // Nothing behind the stage should scroll while it covers the screen, and
  // Escape should get out of it the way it would out of real fullscreen.
  useEffect(() => {
    if (!isFallbackFullscreen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') setIsFallbackFullscreen(false)
    }
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [isFallbackFullscreen])

  const toggleFullscreen = useCallback(() => {
    const element = containerRef.current as WebkitFullscreenElement | null
    if (!element) return

    if (isFallbackFullscreen) {
      setIsFallbackFullscreen(false)
      return
    }

    if (currentFullscreenElement()) {
      const exit = document.exitFullscreen?.bind(document) ?? doc().webkitExitFullscreen?.bind(document)
      void Promise.resolve(exit?.()).catch(() => undefined)
      return
    }

    const request =
      element.requestFullscreen?.bind(element) ?? element.webkitRequestFullscreen?.bind(element)

    if (!request) {
      setIsFallbackFullscreen(true)
      return
    }

    // Supported but refused — a denied permission, or a gesture the browser did
    // not treat as user-initiated. Fall back rather than doing nothing at all.
    void Promise.resolve(request()).catch(() => setIsFallbackFullscreen(true))
  }, [containerRef, isFallbackFullscreen])

  return {
    isFullscreen: isNativeFullscreen || isFallbackFullscreen,
    toggleFullscreen,
    fallbackStyle: isFallbackFullscreen ? FALLBACK_STYLE : {},
  }
}
