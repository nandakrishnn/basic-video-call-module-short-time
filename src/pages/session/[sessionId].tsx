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
import { createAppointmentRequest, getAppointmentsByPhysioRequest } from '@/services/appointment.service'
import { listPatientsRequest } from '@/services/patient.service'
import { endSessionRequest, getSessionRequest, startSessionRequest } from '@/services/session.service'
import type { Appointment, AppointmentType } from '@/types/appointment.types'
import type { Session } from '@/types/session.types'
import type { User } from '@/types/user.types'
import { getQuickNote, getToken, setQuickNote } from '@/utils/storage'

const DEFAULT_SESSION_TYPE = 'followup'

const ageFromDob = (dob: string | null): number | null => {
  if (!dob) return null
  const born = new Date(dob)
  if (Number.isNaN(born.getTime())) return null
  const now = new Date()
  let age = now.getFullYear() - born.getFullYear()
  const beforeBirthday =
    now.getMonth() < born.getMonth() || (now.getMonth() === born.getMonth() && now.getDate() < born.getDate())
  if (beforeBirthday) age -= 1
  return age >= 0 && age < 130 ? age : null
}

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
  const [isEndingCall, setIsEndingCall] = useState(false)
  const [patient, setPatient] = useState<User | null>(null)
  const [sessionType, setSessionType] = useState(DEFAULT_SESSION_TYPE)

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

  const isPhysio = user?.role === 'physio'

  // The session record carries only patientId, and /api/patients is physio-only,
  // so the patient's details are joined here rather than shipped with it. The
  // panel that shows them renders for the physio alone, so the role restriction
  // costs nothing.
  useEffect(() => {
    if (!isPhysio || !session) return
    const token = getToken()
    if (!token) return

    listPatientsRequest(token).then((res) => {
      if (!res.success) return
      setPatient(res.data.find((candidate) => candidate.id === session.patientId) ?? null)
    })
  }, [isPhysio, session])

  // Session type lives on the appointment, not the session.
  useEffect(() => {
    if (!isPhysio || !session?.appointmentId || !user) return
    const token = getToken()
    if (!token) return

    getAppointmentsByPhysioRequest(token, user.id).then((res) => {
      if (!res.success) return
      const appointment = res.data.find((a) => a.id === session.appointmentId)
      if (appointment) setSessionType(appointment.sessionType)
    })
  }, [isPhysio, session?.appointmentId, user])

  // Only the physio starting the session flips it to 'active' — a patient
  // opening the join link first must not be able to trigger this themselves.
  useEffect(() => {
    if (!isPhysio || !session || !sessionId || session.status !== 'scheduled') return
    const token = getToken()
    if (!token) return
    startSessionRequest(token, sessionId).then((res) => {
      if (res.success) setSession(res.data)
    })
  }, [isPhysio, session, sessionId])

  // Patient side: keep checking until the physio has actually started the
  // session, rather than letting them straight into an empty/unattended call.
  useEffect(() => {
    if (isPhysio || !sessionId || session?.status !== 'scheduled') return
    const token = getToken()
    if (!token) return

    const interval = setInterval(() => {
      getSessionRequest(token, sessionId).then((res) => {
        if (res.success) setSession(res.data)
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [isPhysio, session?.status, sessionId])

  const handleCallEnded = (): void => {
    if (!sessionId) return
    const token = getToken()
    if (!token) return
    setIsEndingCall(true)
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

  // The physio sees the patient; the patient sees their physio. Falls back to a
  // role word until the join lands, rather than the literal "Patient" this
  // screen used to show both sides.
  const counterpartLabel = isPhysio
    ? (patient?.fullName ?? MESSAGES.session.rolePatient)
    : MESSAGES.session.rolePhysio
  const sessionSubtitle = isPhysio && patient?.issue?.trim() ? patient.issue.trim() : sessionType

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

  if (!isPhysio && session.status === 'scheduled') {
    return <PageState tone="loading" message={MESSAGES.session.waitingForPhysio} />
  }

  return (
    <div className="session-layout" style={{ padding: 18, background: COLORS.background }}>
      <div className="session-video-area">
        {callEndedForPatient ? (
          <PostCallPatientPrompt onGoToDashboard={() => void router.push(ROUTES.dashboardPatient)} />
        ) : isEndingCall ? (
          <PageState tone="loading" message={MESSAGES.session.endingCall} />
        ) : hasJoined ? (
          <VideoStage
            roomName={session.jitsiRoomName ?? session.roomName}
            displayName={user?.fullName ?? 'Guest'}
            jwt={session.jitsiJwt}
            isModerator={isPhysio}
            patientName={counterpartLabel}
            counterpartName={counterpartLabel}
            sessionType={sessionSubtitle}
            onCallEnded={handleCallEnded}
          />
        ) : (
          <PreCallScreen
            patientName={counterpartLabel}
            sessionType={sessionSubtitle}
            onJoin={() => setHasJoined(true)}
          />
        )}
      </div>
      {isPhysio && (
        <PhysioSessionPanel
          patient={patient ?? undefined}
          patientAge={ageFromDob(patient?.dateOfBirth ?? null)}
          sessionType={sessionType}
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
          patientEmail={patient?.email ?? null}
          patientName={counterpartLabel}
          physioName={user?.fullName ?? ''}
          onSchedule={handleSchedule}
          onClose={handleClosePostCallModal}
        />
      )}
    </div>
  )
}

export default SessionPage
