import { History } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/shared/Button'
import { Modal } from '@/components/shared/Modal'
import { PageState } from '@/components/shared/PageState'
import { COLORS, FONT_SIZES, RADII } from '@/constants/colors'
import { MESSAGES } from '@/constants/messages'
import { getPatientHistoryRequest } from '@/services/patient.service'
import type { PatientSessionEntry } from '@/types/session.types'
import { parseUtc } from '@/utils/date'
import { getToken } from '@/utils/storage'

interface PastNotesButtonProps {
  patientId: string
  patientName: string
  /** The call in progress — it has no notes yet, so it is left out. */
  currentSessionId?: string
}

const stamp = (isoLike: string): string =>
  parseUtc(isoLike).toLocaleString([], {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })

/**
 * The patient's previous notes, without leaving the call.
 *
 * Loaded when the modal opens rather than with the panel: most calls never ask
 * for it, and a request per call start is one the physio waits on for nothing.
 */
export const PastNotesButton = ({
  patientId,
  patientName,
  currentSessionId,
}: PastNotesButtonProps): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false)
  const [sessions, setSessions] = useState<PatientSessionEntry[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const open = async (): Promise<void> => {
    setIsOpen(true)
    if (sessions) return

    const token = getToken()
    if (!token) return

    setIsLoading(true)
    setError(null)
    const res = await getPatientHistoryRequest(token, patientId)
    setIsLoading(false)

    if (res.success) setSessions(res.data.sessions)
    else setError(res.message)
  }

  // Only sessions that were actually written up are worth showing here — an
  // empty entry tells the physio nothing mid-call.
  const withNotes = (sessions ?? []).filter(
    (session) => session.id !== currentSessionId && (session.notes?.enhancedNotes ?? session.notes?.rawNotes),
  )

  return (
    <>
      <Button variant="secondary" size="sm" fullWidth onClick={() => void open()}>
        <History size={15} />
        {MESSAGES.session.pastNotesButton}
      </Button>

      {isOpen && (
        <Modal
          title={MESSAGES.session.pastNotesTitle}
          subtitle={patientName}
          maxWidth={560}
          onClose={() => setIsOpen(false)}
          footer={
            <Button variant="secondary" fullWidth onClick={() => setIsOpen(false)}>
              {MESSAGES.common.close}
            </Button>
          }
        >
          {isLoading ? (
            <PageState tone="loading" message={MESSAGES.session.pastNotesLoading} />
          ) : error ? (
            <PageState tone="error" message={error} />
          ) : withNotes.length === 0 ? (
            <p style={{ color: COLORS.text.muted, fontSize: FONT_SIZES.base, margin: 0, textAlign: 'center' }}>
              {MESSAGES.session.pastNotesEmpty}
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {withNotes.map((session) => (
                <details key={session.id} className="past-note" open={withNotes.length === 1}>
                  <summary className="past-note-summary">
                    <span style={{ color: COLORS.text.primary, fontWeight: 700, fontSize: FONT_SIZES.base }}>
                      {MESSAGES.patients.sessionLabel} {session.sessionNumber}
                      {session.sessionType ? ` · ${session.sessionType}` : ''}
                    </span>
                    {(session.startedAt ?? session.scheduledAt) && (
                      <span style={{ color: COLORS.text.muted, fontSize: FONT_SIZES.sm }}>
                        {stamp((session.startedAt ?? session.scheduledAt) as string)}
                      </span>
                    )}
                  </summary>
                  <div
                    style={{
                      marginTop: 10,
                      padding: 14,
                      borderRadius: RADII.sm,
                      background: COLORS.primarySofter,
                      color: COLORS.text.secondary,
                      fontSize: FONT_SIZES.base,
                      lineHeight: 1.65,
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {session.notes?.enhancedNotes ?? session.notes?.rawNotes}
                  </div>
                </details>
              ))}
            </div>
          )}
        </Modal>
      )}
    </>
  )
}
