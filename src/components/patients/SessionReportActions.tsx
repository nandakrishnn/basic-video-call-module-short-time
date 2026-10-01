import { PencilLine, Send } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/shared/Button'
import { Textarea } from '@/components/shared/Input'
import { Modal } from '@/components/shared/Modal'
import { COLORS, FONT_SIZES } from '@/constants/colors'
import { MESSAGES } from '@/constants/messages'
import { approveNotesRequest, generatePdfRequest, sendNotesRequest } from '@/services/notes.service'
import { NOTE_SECTIONS, composeNotes, hasAnyContent, parseNotes, type NoteSectionKey } from '@/utils/notes'
import { getToken } from '@/utils/storage'

interface SessionReportActionsProps {
  notesId: string
  /** The approved text — enhanced where it exists, otherwise what was written. */
  notesText: string
  isSentToPatient: boolean
  onChanged: () => void
}

/**
 * Sending and editing a session's report after the fact.
 *
 * Declining to send at the end of a call used to be final: the notes were
 * saved, but nothing anywhere offered to send them afterwards, and nothing
 * offered to correct them. Both are reachable here, from the session they
 * belong to.
 */
export const SessionReportActions = ({
  notesId,
  notesText,
  isSentToPatient,
  onChanged,
}: SessionReportActionsProps): JSX.Element => {
  const [isEditing, setIsEditing] = useState(false)
  const [fields, setFields] = useState(() => parseNotes(notesText))
  const [isSending, setIsSending] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSend = async (): Promise<void> => {
    const token = getToken()
    if (!token) return

    setIsSending(true)
    setError(null)

    // The PDF is regenerated rather than reused: the notes may have been
    // edited since it was last built, and sending a stale one is worse than
    // the extra second.
    const pdfRes = await generatePdfRequest(token, notesId)
    if (!pdfRes.success) {
      setIsSending(false)
      setError(pdfRes.message)
      return
    }

    const res = await sendNotesRequest(token, notesId, true)
    setIsSending(false)

    if (res.success) onChanged()
    else setError(res.message)
  }

  const handleSave = async (): Promise<void> => {
    const token = getToken()
    if (!token) return

    setIsSaving(true)
    setError(null)
    const res = await approveNotesRequest(token, notesId, composeNotes(fields))
    setIsSaving(false)

    if (!res.success) {
      setError(res.message)
      return
    }

    setIsEditing(false)
    onChanged()
  }

  return (
    <>
      {!isSentToPatient && (
        <Button variant="primary" size="sm" isLoading={isSending} onClick={() => void handleSend()}>
          <Send size={14} />
          {MESSAGES.patients.sendReport}
        </Button>
      )}

      <Button
        variant="secondary"
        size="sm"
        onClick={() => {
          setFields(parseNotes(notesText))
          setError(null)
          setIsEditing(true)
        }}
      >
        <PencilLine size={14} />
        {MESSAGES.patients.editNotes}
      </Button>

      {error && !isEditing && (
        <span role="alert" style={{ color: COLORS.status.error, fontSize: FONT_SIZES.sm }}>
          {error}
        </span>
      )}

      {isEditing && (
        <Modal
          title={MESSAGES.patients.editNotesTitle}
          subtitle={isSentToPatient ? MESSAGES.patients.editNotesResendHint : undefined}
          maxWidth={620}
          onClose={() => setIsEditing(false)}
          footer={
            <div style={{ display: 'flex', gap: 10 }}>
              <Button variant="secondary" onClick={() => setIsEditing(false)} style={{ flex: 1 }}>
                {MESSAGES.common.cancel}
              </Button>
              <Button
                variant="primary"
                disabled={!hasAnyContent(fields)}
                isLoading={isSaving}
                onClick={() => void handleSave()}
                style={{ flex: 2 }}
              >
                {MESSAGES.common.save}
              </Button>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {NOTE_SECTIONS.map(({ key, label }) => (
              <label key={key} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ color: COLORS.text.primary, fontSize: FONT_SIZES.base, fontWeight: 700 }}>
                  {label}
                </span>
                <Textarea
                  value={fields[key]}
                  onChange={(e) =>
                    setFields((prev) => ({ ...prev, [key as NoteSectionKey]: e.target.value }))
                  }
                  rows={3}
                  style={{ fontSize: FONT_SIZES.md, lineHeight: 1.6 }}
                />
              </label>
            ))}

            {error && (
              <p role="alert" style={{ color: COLORS.status.error, fontSize: FONT_SIZES.base, margin: 0 }}>
                {error}
              </p>
            )}
          </div>
        </Modal>
      )}
    </>
  )
}
