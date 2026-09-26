import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { StructuredNotesEditor } from '@/components/notes/StructuredNotesEditor'
import { SendToggle } from '@/components/notes/SendToggle'
import { Button } from '@/components/shared/Button'
import { COLORS } from '@/constants/colors'
import { MESSAGES } from '@/constants/messages'
import { ROUTES } from '@/constants/routes'
import {
  approveNotesRequest,
  createNotesRequest,
  enhanceNotesRequest,
  generatePdfRequest,
  sendNotesRequest,
} from '@/services/notes.service'
import { EMPTY_NOTE_FIELDS, composeNotes, parseNotes, type NoteSectionKey } from '@/utils/notes'
import { clearQuickNote, getQuickNote, getToken } from '@/utils/storage'

type Step = 'raw' | 'send' | 'done'

const NotesPage = (): JSX.Element => {
  const router = useRouter()
  const { sessionId } = router.query as { sessionId?: string }

  const [step, setStep] = useState<Step>('raw')
  const [fields, setFields] = useState(EMPTY_NOTE_FIELDS)
  const [notesId, setNotesId] = useState<string | null>(null)
  const [sendEnabled, setSendEnabled] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  /** Which raw-step action is in flight, so only that button shows a spinner. */
  const [pendingAction, setPendingAction] = useState<'proofread' | 'save' | null>(null)
  const [hasProofread, setHasProofread] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!sessionId) return
    const draft = getQuickNote(sessionId)
    if (draft) {
      setFields(parseNotes(draft))
      clearQuickNote(sessionId)
    }
  }, [sessionId])

  const handleAutoSave = async (): Promise<void> => {
    const value = composeNotes(fields)
    const token = getToken()
    if (!token || !sessionId || notesId) return
    const res = await createNotesRequest(token, sessionId, value)
    if (res.success) setNotesId(res.data.id)
  }

  /** The record is created lazily, so both actions may have to make it first. */
  const ensureNotesId = async (token: string, id: string): Promise<string | null> => {
    if (notesId) return notesId
    const res = await createNotesRequest(token, id, composeNotes(fields))
    if (!res.success) {
      setError(res.message)
      return null
    }
    setNotesId(res.data.id)
    return res.data.id
  }

  // Proofreads in place: the corrected text is parsed straight back into the
  // fields the physio is already looking at, so there is no second screen to
  // compare against. Their current text is sent along rather than relying on
  // the stored copy, which may be an older autosave.
  const handleProofread = async (): Promise<void> => {
    const token = getToken()
    if (!token || !sessionId) return

    setPendingAction('proofread')
    setError(null)
    setHasProofread(false)

    const currentNotesId = await ensureNotesId(token, sessionId)
    if (!currentNotesId) {
      setPendingAction(null)
      return
    }

    const res = await enhanceNotesRequest(token, currentNotesId, composeNotes(fields))
    setPendingAction(null)

    if (!res.success) {
      setError(res.message)
      return
    }

    // Only overwrite when there is something to overwrite with — a blank reply
    // would silently wipe the physio's notes.
    const enhanced = res.data.enhancedNotes
    if (!enhanced?.trim()) {
      setError(MESSAGES.notes.enhanceFailed)
      return
    }

    setFields(parseNotes(enhanced))
    setHasProofread(true)
  }

  const handleContinue = async (): Promise<void> => {
    const token = getToken()
    if (!token || !sessionId) return

    setPendingAction('save')
    setError(null)

    const currentNotesId = await ensureNotesId(token, sessionId)
    if (!currentNotesId) {
      setPendingAction(null)
      return
    }

    const res = await approveNotesRequest(token, currentNotesId, composeNotes(fields))
    setPendingAction(null)

    if (res.success) setStep('send')
    else setError(res.message)
  }

  const handleFinish = async (): Promise<void> => {
    const token = getToken()
    if (!token || !notesId) return

    setIsSubmitting(true)
    setError(null)

    if (sendEnabled) {
      const pdfRes = await generatePdfRequest(token, notesId)
      if (!pdfRes.success) {
        setIsSubmitting(false)
        setError(pdfRes.message)
        return
      }
    }

    const res = await sendNotesRequest(token, notesId, sendEnabled)
    setIsSubmitting(false)

    if (res.success) setStep('done')
    else setError(res.message)
  }

  if (step === 'done') {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 20,
          background: COLORS.background,
        }}
      >
        <p style={{ color: COLORS.status.success, fontWeight: 700, fontSize: '1.05rem', margin: 0 }}>Notes saved.</p>
        <Button variant="primary" onClick={() => void router.push(ROUTES.dashboardPhysio)}>
          Back to dashboard
        </Button>
      </div>
    )
  }

  return (
    <div
      style={{
        maxWidth: 900,
        margin: '40px auto',
        padding: '0 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
      }}
    >
      {/* Both raw-step actions require at least one filled section, so without
          this the page is a dead end for a physio who opened it with nothing
          to record. */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <h1 style={{ color: COLORS.text.primary, fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Session notes</h1>
        <Button variant="ghost" size="sm" onClick={() => void router.push(ROUTES.dashboardPhysio)}>
          {MESSAGES.notes.backToDashboard}
        </Button>
      </div>

      {step === 'raw' && (
        <StructuredNotesEditor
          fields={fields}
          onChange={(key: NoteSectionKey, value: string) =>
            setFields((prev) => ({ ...prev, [key]: value }))
          }
          onAutoSave={() => void handleAutoSave()}
          onProofread={() => void handleProofread()}
          onContinue={() => void handleContinue()}
          isProofreading={pendingAction === 'proofread'}
          isSaving={pendingAction === 'save'}
          hasProofread={hasProofread}
        />
      )}

      {step === 'send' && (
        <SendToggle
          isEnabled={sendEnabled}
          onToggle={setSendEnabled}
          onConfirm={() => void handleFinish()}
          isSending={isSubmitting}
        />
      )}

      {error && <p style={{ color: COLORS.status.error, fontSize: '0.85rem' }}>{error}</p>}
    </div>
  )
}

export default NotesPage
