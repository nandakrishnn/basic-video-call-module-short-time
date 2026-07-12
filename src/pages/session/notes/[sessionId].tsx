import { useRouter } from 'next/router'
import { useState } from 'react'
import { EnhancedNotesPanel } from '@/components/notes/EnhancedNotesPanel'
import { RawNotesEditor } from '@/components/notes/RawNotesEditor'
import { SendToggle } from '@/components/notes/SendToggle'
import { COLORS } from '@/constants/colors'
import { ROUTES } from '@/constants/routes'
import {
  approveNotesRequest,
  createNotesRequest,
  enhanceNotesRequest,
  generatePdfRequest,
  sendNotesRequest,
} from '@/services/notes.service'
import { getToken } from '@/utils/storage'

type Step = 'raw' | 'enhance' | 'send' | 'done'

const NotesPage = (): JSX.Element => {
  const router = useRouter()
  const { sessionId } = router.query as { sessionId?: string }

  const [step, setStep] = useState<Step>('raw')
  const [rawNotes, setRawNotes] = useState('')
  const [enhancedNotes, setEnhancedNotes] = useState('')
  const [notesId, setNotesId] = useState<string | null>(null)
  const [sendEnabled, setSendEnabled] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAutoSave = async (value: string): Promise<void> => {
    const token = getToken()
    if (!token || !sessionId || notesId) return
    const res = await createNotesRequest(token, sessionId, value)
    if (res.success) setNotesId(res.data.id)
  }

  const handleEnhance = async (): Promise<void> => {
    const token = getToken()
    if (!token || !sessionId) return

    setIsSubmitting(true)
    setError(null)

    let currentNotesId = notesId
    if (!currentNotesId) {
      const createRes = await createNotesRequest(token, sessionId, rawNotes)
      if (!createRes.success) {
        setIsSubmitting(false)
        setError(createRes.message)
        return
      }
      currentNotesId = createRes.data.id
      setNotesId(currentNotesId)
    }

    const enhanceRes = await enhanceNotesRequest(token, currentNotesId)
    setIsSubmitting(false)

    if (enhanceRes.success) {
      setEnhancedNotes(enhanceRes.data.enhancedNotes ?? '')
      setStep('enhance')
    } else {
      setError(enhanceRes.message)
    }
  }

  const handleApprove = async (): Promise<void> => {
    const token = getToken()
    if (!token || !notesId) return

    setIsSubmitting(true)
    setError(null)
    const res = await approveNotesRequest(token, notesId, enhancedNotes)
    setIsSubmitting(false)

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
      <div style={{ padding: 40, textAlign: 'center' }}>
        <p style={{ color: COLORS.status.success, fontWeight: 700, marginBottom: 16 }}>Notes saved.</p>
        <button
          type="button"
          onClick={() => void router.push(ROUTES.dashboardPhysio)}
          style={{
            padding: '10px 24px',
            borderRadius: 10,
            border: 'none',
            background: COLORS.primary,
            color: COLORS.text.inverse,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Back to dashboard
        </button>
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
        gap: 20,
      }}
    >
      <h1 style={{ color: COLORS.text.primary, fontSize: '1.2rem', fontWeight: 800 }}>Session notes</h1>

      {step === 'raw' && (
        <RawNotesEditor
          value={rawNotes}
          onChange={setRawNotes}
          onAutoSave={(value) => void handleAutoSave(value)}
          onSubmit={() => void handleEnhance()}
          isSubmitting={isSubmitting}
        />
      )}

      {step === 'enhance' && (
        <EnhancedNotesPanel
          rawNotes={rawNotes}
          enhancedNotes={enhancedNotes}
          onEnhancedChange={setEnhancedNotes}
          onApprove={() => void handleApprove()}
          isSaving={isSubmitting}
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
