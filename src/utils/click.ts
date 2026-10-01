/** Roughly a double-click interval — long enough to catch the second click. */
const SWALLOW_WINDOW_MS = 350

/**
 * Discards the next click anywhere on the page.
 *
 * A popover that closes on selection leaves whatever it was covering directly
 * under the cursor, so the second click of a double-click lands on that
 * instead — picking a patient could press the button beneath the list, and
 * picking a date could open the field below it. Anyone who double-clicks by
 * habit hits this every time.
 */
export const swallowNextClick = (): void => {
  const onClick = (event: MouseEvent): void => {
    event.preventDefault()
    event.stopPropagation()
    cleanup()
  }

  const cleanup = (): void => {
    document.removeEventListener('click', onClick, true)
    window.clearTimeout(timer)
  }

  // Released on a timer as well: with no second click the listener would
  // otherwise sit there and eat an unrelated one later.
  const timer = window.setTimeout(cleanup, SWALLOW_WINDOW_MS)
  document.addEventListener('click', onClick, true)
}
