/**
 * Enough of a phone or email to recognise your own, not enough to learn
 * someone else's.
 *
 * The join-link lookup is unauthenticated — it has to be, since the patient
 * has not signed in yet — so whatever it returns is readable by anyone holding
 * a session id. It used to return the patient's contact details in full.
 */
export const maskIdentifier = (value: string): string => {
  const trimmed = value.trim()
  if (!trimmed) return ''

  const at = trimmed.indexOf('@')
  if (at > 0) {
    const name = trimmed.slice(0, at)
    const domain = trimmed.slice(at)
    const head = name.slice(0, Math.min(2, name.length))
    return head + '*'.repeat(Math.max(1, name.length - head.length)) + domain
  }

  // A phone number: the last few digits are the part people recognise.
  const tail = trimmed.slice(-3)
  return '*'.repeat(Math.max(2, trimmed.length - tail.length)) + tail
}
