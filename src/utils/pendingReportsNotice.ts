const STORAGE_KEY = 'yorphysio_pending_reports_notified'

const read = (): number => {
  try {
    return Number(window.sessionStorage.getItem(STORAGE_KEY)) || 0
  } catch {
    // Private browsing, or storage blocked. Treating it as "not yet told" means
    // the reminder shows once per page load rather than never.
    return 0
  }
}

const write = (count: number): void => {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, String(count))
  } catch {
    // Nothing to do — the reminder simply repeats next time.
  }
}

/**
 * Whether the physio should be reminded about reports still owed.
 *
 * Once per browser session, and again only when the number has grown — a
 * reminder on every visit to the dashboard is noise, and noise is what people
 * learn to dismiss without reading. sessionStorage rather than localStorage so
 * it returns the next time they sit down, rather than staying quiet for ever.
 */
export const shouldAnnouncePendingReports = (count: number): boolean => {
  if (count <= 0) {
    write(0)
    return false
  }

  const alreadyTold = read()
  write(count)
  return count > alreadyTold
}
