import { useEffect, useRef, type RefObject } from 'react'

type ElementRef = RefObject<HTMLElement | null>

/**
 * Dismisses an open popover on Escape, an outside press, a page scroll or a
 * resize.
 *
 * The outside press is a document listener rather than a full-screen overlay
 * div. An overlay has to sit above everything to catch the press, so it also
 * covers whatever is behind it and swallows that press: a button under the
 * overlay needs two clicks, one to dismiss and one to act. That read as the
 * button being broken.
 *
 * Scrolls that start inside the popover are ignored, so a popover with its own
 * scrollable list doesn't close the moment the list is scrolled.
 */
export const useDismissOnOutside = (
  isOpen: boolean,
  onDismiss: () => void,
  ...insideRefs: ElementRef[]
): void => {
  // Held in refs so the listeners are attached once per open, rather than
  // being torn down and rebuilt on every render.
  const refsRef = useRef(insideRefs)
  refsRef.current = insideRefs
  const dismissRef = useRef(onDismiss)
  dismissRef.current = onDismiss

  useEffect(() => {
    if (!isOpen) return

    const isInside = (target: EventTarget | null): boolean =>
      target instanceof Node && refsRef.current.some((ref) => ref.current?.contains(target))

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') dismissRef.current()
    }
    const onPointerDown = (event: PointerEvent): void => {
      if (!isInside(event.target)) dismissRef.current()
    }
    const onScroll = (event: Event): void => {
      if (!isInside(event.target)) dismissRef.current()
    }
    const onResize = (): void => dismissRef.current()

    document.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('resize', onResize)
    window.addEventListener('scroll', onScroll, true)

    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('scroll', onScroll, true)
    }
  }, [isOpen])
}
