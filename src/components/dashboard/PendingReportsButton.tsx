import { Bell, PencilLine } from 'lucide-react'
import Link from 'next/link'
import { useRef, useState } from 'react'
import { COLORS, FONT_SIZES } from '@/constants/colors'
import { MESSAGES } from '@/constants/messages'
import { ROUTES } from '@/constants/routes'
import { useDismissOnOutside } from '@/hooks/useDismissOnOutside'
import type { PendingReport } from '@/types/dashboard.types'
import { parseUtc } from '@/utils/date'

interface PendingReportsButtonProps {
  reports: PendingReport[]
}

const stamp = (iso: string): string =>
  parseUtc(iso).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' })

/**
 * Sessions whose report never reached the patient.
 *
 * Nothing used to surface these: a write-up skipped at the end of a call, or
 * written and then not sent, was only ever found again by remembering it
 * existed and going looking through the patient's history.
 */
export const PendingReportsButton = ({ reports }: PendingReportsButtonProps): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useDismissOnOutside(isOpen, () => setIsOpen(false), panelRef, triggerRef)

  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={`${MESSAGES.dashboard.pendingReportsTitle} (${reports.length})`}
        aria-expanded={isOpen}
        className="pending-bell"
      >
        <Bell size={19} />
        {reports.length > 0 && <span className="pending-bell-count">{reports.length}</span>}
      </button>

      {isOpen && (
        <div ref={panelRef} role="dialog" aria-label={MESSAGES.dashboard.pendingReportsTitle} className="pending-panel">
          <p style={{ color: COLORS.text.primary, fontSize: FONT_SIZES.base, fontWeight: 700, margin: '0 0 2px' }}>
            {MESSAGES.dashboard.pendingReportsTitle}
          </p>
          <p style={{ color: COLORS.text.muted, fontSize: FONT_SIZES.sm, margin: '0 0 12px' }}>
            {MESSAGES.dashboard.pendingReportsBody}
          </p>

          {reports.length === 0 ? (
            <p style={{ color: COLORS.text.muted, fontSize: FONT_SIZES.base, margin: 0, padding: '8px 0' }}>
              {MESSAGES.dashboard.pendingReportsEmpty}
            </p>
          ) : (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {reports.map((report) => (
                <li key={report.sessionId}>
                  {/* Straight into writing them up — the whole point is to
                      remove the hunt through a patient's history. */}
                  <Link
                    href={ROUTES.sessionNotes(report.sessionId)}
                    onClick={() => setIsOpen(false)}
                    className="pending-row"
                  >
                    <span style={{ minWidth: 0 }}>
                      <span
                        style={{
                          display: 'block',
                          color: COLORS.text.primary,
                          fontSize: FONT_SIZES.base,
                          fontWeight: 700,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {report.patientName}
                      </span>
                      <span style={{ color: COLORS.text.muted, fontSize: FONT_SIZES.sm }}>
                        {stamp(report.heldAt)} ·{' '}
                        {report.hasNotes
                          ? MESSAGES.dashboard.pendingNotSent
                          : MESSAGES.dashboard.pendingNoNotes}
                      </span>
                    </span>
                    <PencilLine size={15} color={COLORS.primaryStrong} style={{ flexShrink: 0 }} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
