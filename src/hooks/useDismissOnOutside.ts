import { useEffect, useRef, type RefObject } from 'react'
import { swallowNextClick } from '@/utils/click'

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

    // A popover open inside a dialog has to claim the gesture that dismisses
    // it. Without this one click outside closed the popover and then reached
    // the dialog's backdrop, closing that too — the whole form went away when
    // the intent was to put a time picker down.
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== 'Escape') return
      event.stopImmediatePropagation()
      dismissRef.current()
    }
    const onPointerDown = (event: PointerEvent): void => {
      if (isInside(event.target)) return
      dismissRef.current()
      swallowNextClick()
    }
    const onScroll = (event: Event): void => {
      if (!isInside(event.target)) dismissRef.current()
    }
    const onResize = (): void => dismissRef.current()

    document.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('keydown', onKeyDown, true)
    window.addEventListener('resize', onResize)
    window.addEventListener('scroll', onScroll, true)

    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('keydown', onKeyDown, true)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('scroll', onScroll, true)
    }
  }, [isOpen])
}
