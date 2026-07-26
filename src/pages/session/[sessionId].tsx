import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { PostCallModal } from '@/components/appointments/PostCallModal'
import { PageState } from '@/components/shared/PageState'
import { PhysioSessionPanel } from '@/components/video/PhysioSessionPanel'
import { PostCallPatientPrompt } from '@/components/video/PostCallPatientPrompt'
import { PreCallScreen } from '@/components/video/PreCallScreen'
import { QuickNoteModal } from '@/components/video/QuickNoteModal'
import { VideoStage } from '@/components/video/VideoStage'
import { COLORS } from '@/constants/colors'
import { MESSAGES } from '@/constants/messages'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/hooks/useAuth'
import { createAppointmentRequest } from '@/services/appointment.service'
import { endSessionRequest, getSessionRequest, startSessionRequest } from '@/services/session.service'
import type { Appointment, AppointmentType } from '@/types/appointment.types'
import type { Session } from '@/types/session.types'
import { getQuickNote, getToken, setQuickNote } from '@/utils/storage'

const SessionPage = (): JSX.Element => {
  const router = useRouter()
  const { sessionId } = router.query as { sessionId?: string }
  const { user, isLoading: isAuthLoading } = useAuth()

  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showPostCallModal, setShowPostCallModal] = useState(false)
  const [hasJoined, setHasJoined] = useState(false)
  const [callEndedForPatient, setCallEndedForPatient] = useState(false)
  const [showQuickNote, setShowQuickNote] = useState(false)

  useEffect(() => {
    if (!sessionId) return
    const token = getToken()
    if (!token) return

    getSessionRequest(token, sessionId)
      .then((res) => {
        if (res.success) setSession(res.data)
        else setError(res.message)
      })
      .finally(() => setIsLoading(false))
  }, [sessionId])

  useEffect(() => {
    if (!session || !sessionId || session.status !== 'scheduled') return
    const token = getToken()
    if (!token) return
    startSessionRequest(token, sessionId).then((res) => {
      if (res.success) setSession(res.data)
    })
  }, [session, sessionId])

  const handleCallEnded = (): void => {
    if (!sessionId) return
    const token = getToken()
    if (!token) return
    endSessionRequest(token, sessionId).then((res) => {
      if (user?.role !== 'physio') {
        setCallEndedForPatient(true)
        return
      }
      if (res.success) setShowPostCallModal(true)
      else void router.push(ROUTES.dashboardPhysio)
    })
  }

  const handleSchedule = async (data: {
    scheduledAt: string
    sessionType: AppointmentType
    internalNote?: string
  }): Promise<Appointment | null> => {
    const token = getToken()
    if (!token || !session) return null
    const res = await createAppointmentRequest(token, { patientId: session.patientId, ...data })
    return res.success ? res.data : null
  }

  const handleClosePostCallModal = (): void => {
    setShowPostCallModal(false)
    void router.push(ROUTES.dashboardPhysio)
  }

  const handleEndAndWriteNotes = (): void => {
    if (!sessionId) return
    const token = getToken()
    if (!token) return
    endSessionRequest(token, sessionId).then(() => {
      void router.push(ROUTES.sessionNotes(sessionId))
    })
  }

  if (isLoading || isAuthLoading) {
    return <PageState tone="loading" message={MESSAGES.session.connecting} />
  }

  if (error || !session) {
    return <PageState tone="error" message={error ?? MESSAGES.session.notYetActive} />
  }

  if (session.status === 'completed' || session.status === 'cancelled') {
    return <PageState tone="neutral" message={MESSAGES.session.ended} />
  }

  const isPhysio = user?.role === 'physio'

  return (
    <div className="session-layout" style={{ padding: 16, background: COLORS.background }}>
      <div className="session-video-area" style={{ flex: 1 }}>
        {callEndedForPatient ? (
          <PostCallPatientPrompt onGoToDashboard={() => void router.push(ROUTES.dashboardPatient)} />
        ) : hasJoined ? (
          <VideoStage
            roomName={session.jitsiRoomName ?? session.roomName}
            displayName={user?.fullName ?? 'Guest'}
            jwt={session.jitsiJwt}
            patientName="Patient"
            sessionType="Follow-up"
            onCallEnded={handleCallEnded}
          />
        ) : (
          <PreCallScreen patientName="Patient" sessionType="Follow-up" onJoin={() => setHasJoined(true)} />
        )}
      </div>
      {isPhysio && (
        <PhysioSessionPanel
          patientName="Patient"
          patientAge={null}
          sessionNumber={1}
          scheduledAt={session.startedAt ?? ''}
          actualStartAt={session.startedAt}
          onQuickNote={() => setShowQuickNote(true)}
          onEndCallAndWriteNotes={handleEndAndWriteNotes}
        />
      )}
      {showQuickNote && sessionId && (
        <QuickNoteModal
          initialValue={getQuickNote(sessionId)}
          onSave={(value) => setQuickNote(sessionId, value)}
          onClose={() => setShowQuickNote(false)}
        />
      )}
      {showPostCallModal && (
        <PostCallModal
          patientEmail={null}
          patientName="Patient"
          physioName={user?.fullName ?? ''}
          onSchedule={handleSchedule}
          onClose={handleClosePostCallModal}
        />
      )}
    </div>
  )
}

export default SessionPage
