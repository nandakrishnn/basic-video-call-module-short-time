import { useRouter } from 'next/router'
import { useCallback, useEffect, useState } from 'react'
import { PostCallModal } from '@/components/appointments/PostCallModal'
import { Button } from '@/components/shared/Button'
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
import { getAppointmentsByPhysioRequest } from '@/services/appointment.service'
import { listPatientsRequest } from '@/services/patient.service'
import { endSessionRequest, getSessionRequest, startSessionRequest } from '@/services/session.service'
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
  const [isCheckingAgain, setIsCheckingAgain] = useState(false)

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
  //
  // setInterval alone is not enough. This screen is usually opened from a link
  // in a mail or messaging app, so the patient frequently switches away while
  // waiting — and mobile browsers throttle or suspend timers in a backgrounded
  // tab. The interval then stops firing, and the physio starting the session
  // goes unnoticed: the spinner keeps turning even though the call is live.
  // Re-checking whenever the page becomes visible again (or regains focus, or
  // the network comes back) is what actually catches that case.
  const refreshSession = useCallback(async (): Promise<void> => {
    if (!sessionId) return
    const token = getToken()
    if (!token) return

    try {
      const res = await getSessionRequest(token, sessionId)
      if (res.success) setSession(res.data)
    } catch {
      // A failed poll is not fatal — the next tick, or the patient's own
      // "Check again", will pick the session up.
    }
  }, [sessionId])

  // Only the manual check shows a spinner; the background poll stays silent so
  // the button isn't flickering every five seconds.
  const handleCheckAgain = async (): Promise<void> => {
    setIsCheckingAgain(true)
    await refreshSession()
    setIsCheckingAgain(false)
  }

  useEffect(() => {
    if (isPhysio || !sessionId || session?.status !== 'scheduled') return

    const check = (): void => void refreshSession()
    const checkIfVisible = (): void => {
      if (document.visibilityState === 'visible') check()
    }

    const interval = setInterval(check, 5000)
    document.addEventListener('visibilitychange', checkIfVisible)
    window.addEventListener('focus', check)
    window.addEventListener('online', check)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', checkIfVisible)
      window.removeEventListener('focus', check)
      window.removeEventListener('online', check)
    }
  }, [isPhysio, session?.status, sessionId, refreshSession])

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

  // The physio sees the patient; the patient sees their physio. Falls back to a
  // role word until the join lands, rather than the literal "Patient" this
  // screen used to show both sides.
  const counterpartLabel = isPhysio
    ? (patient?.fullName ?? MESSAGES.session.rolePatient)
    : MESSAGES.session.rolePhysio
  const sessionSubtitle = isPhysio && patient?.issue?.trim() ? patient.issue.trim() : sessionType

  // Writing up the session is the end of this flow, not an alternative to it.
  // This used to return to the dashboard, so ending a call through the post-call
  // steps meant the notes page was never offered at all.
  const handleClosePostCallModal = (): void => {
    setShowPostCallModal(false)
    if (sessionId) void router.push(ROUTES.sessionNotes(sessionId))
    else void router.push(ROUTES.dashboardPhysio)
  }

  // Goes through the same confirmation rather than jumping straight to the
  // notes page — otherwise this route skipped marking the session complete and
  // the booking stayed open.
  const handleEndAndWriteNotes = (): void => {
    if (!sessionId) return
    const token = getToken()
    if (!token) return
    // Left set on purpose: clearing it would re-mount VideoStage, which would
    // rebuild the Jitsi iframe and rejoin the call that was just ended.
    setIsEndingCall(true)
    endSessionRequest(token, sessionId).then((res) => {
      if (res.success) setShowPostCallModal(true)
      else void router.push(ROUTES.sessionNotes(sessionId))
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
    return (
      <PageState
        tone="loading"
        message={MESSAGES.session.waitingForPhysio}
        action={
          <Button variant="secondary" size="sm" isLoading={isCheckingAgain} onClick={() => void handleCheckAgain()}>
            {MESSAGES.session.checkAgain}
          </Button>
        }
      />
    )
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
          patientName={counterpartLabel}
          appointmentId={session.appointmentId}
          token={getToken()}
          onDone={handleClosePostCallModal}
        />
      )}
    </div>
  )
}

export default SessionPage
