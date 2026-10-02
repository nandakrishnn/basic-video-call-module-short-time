import { useRouter } from 'next/router'
import { useCallback, useEffect, useRef, useState } from 'react'
import { PostCallModal } from '@/components/appointments/PostCallModal'
import { Button } from '@/components/shared/Button'
import { PageState } from '@/components/shared/PageState'
import { useToast } from '@/components/shared/Toast'
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
  const { showToast } = useToast()

  /** Guards against starting twice — the join press and Jitsi's event both ask. */
  const hasStartedRef = useRef(false)

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
  /** The call dropped without anyone ending it — offer a way back in. */
  const [hasDroppedOut, setHasDroppedOut] = useState(false)

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

  /**
   * Marks the session live, which is what opens the patient's gate.
   *
   * It first ran on page load, so a session counted as started while the physio
   * was still on their own join screen — the patient's wait ended too early and
   * they walked into an empty room. It then ran only on Jitsi's
   * videoConferenceJoined. That is the most truthful signal, the physio being
   * provably in the room, but it is also the easiest one to lose: an unanswered
   * camera prompt, a slow or blocked iframe, and it simply never arrives. When
   * it didn't, the session stayed "scheduled" for good and the patient sat on a
   * spinner with nothing telling either of them why.
   *
   * Pressing "Join call" is the physio's decision to be in the room, so that is
   * what starts it now. The Jitsi event stays on as a backstop for the paths
   * that mount the stage without passing the join screen, such as a rejoin.
   * Only the physio may do this; a patient opening the link first must not be
   * able to start the session themselves.
   */
  const startSessionNow = async (): Promise<void> => {
    if (!isPhysio || !sessionId || hasStartedRef.current) return
    if (session && session.status !== 'scheduled') return
    const token = getToken()
    if (!token) return

    hasStartedRef.current = true
    const res = await startSessionRequest(token, sessionId)

    if (res.success) {
      // The Jitsi credentials are deliberately carried over from the session
      // already in hand. Every response mints a fresh token, and the stage
      // rebuilds its iframe whenever that prop changes — taking the new one
      // would tear down the call the physio has just walked into.
      setSession((prev) =>
        prev ? { ...res.data, jitsiJwt: prev.jitsiJwt, jitsiRoomName: prev.jitsiRoomName } : res.data,
      )
      return
    }

    // Left retryable on purpose, and never silent: the consultation itself
    // still works, but nobody can reach it until this lands.
    //
    // The server's own reason is carried through rather than replaced by a
    // guess. A generic "check your connection" sent us looking at the network
    // while the request was in fact arriving and being refused — the one thing
    // the physio can act on is why.
    hasStartedRef.current = false
    console.error('Failed to start session:', res.code, res.message)
    showToast(`${MESSAGES.session.startFailed} ${res.message}`, 'error')
  }

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

    // A patient hanging up means they left, not that the consultation is over —
    // it used to end the session outright, so a mis-tap closed the call on a
    // physio still sitting in it and left no way back in. Which of the two it
    // actually is depends on whether the physio has finished, so ask.
    if (!isPhysio) {
      void getSessionRequest(token, sessionId).then((res) => {
        if (res.success && res.data.status !== 'completed') {
          void router.replace(ROUTES.dashboardPatient)
          return
        }
        setCallEndedForPatient(true)
      })
      return
    }

    endSessionRequest(token, sessionId).then((res) => {
      if (res.success) setShowPostCallModal(true)
      else void router.replace(ROUTES.dashboardPhysio)
    })
  }

  // The physio sees who they are treating; the patient sees the brand. Naming
  // the physio here would mean joining that name server-side for a patient,
  // and it is not something they need on this screen.
  const counterpartLabel = isPhysio
    ? (patient?.fullName ?? MESSAGES.session.rolePatient)
    : MESSAGES.session.brandLabel
  const sessionSubtitle = isPhysio && patient?.issue?.trim() ? patient.issue.trim() : sessionType

  // Writing up the session is the end of this flow, not an alternative to it.
  // This used to return to the dashboard, so ending a call through the post-call
  // steps meant the notes page was never offered at all.
  const handleClosePostCallModal = (): void => {
    setShowPostCallModal(false)
    // The call is over either way — going back into it is never useful.
    if (sessionId) void router.replace(ROUTES.sessionNotes(sessionId))
    else void router.replace(ROUTES.dashboardPhysio)
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
      else void router.replace(ROUTES.sessionNotes(sessionId))
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
          <PostCallPatientPrompt onGoToDashboard={() => void router.replace(ROUTES.dashboardPatient)} />
        ) : isEndingCall ? (
          <PageState tone="loading" message={MESSAGES.session.endingCall} />
        ) : hasDroppedOut ? (
          // The session is deliberately left untouched here: it is still
          // active, so rejoining simply re-mounts the stage and walks back in.
          <PageState
            tone="neutral"
            message={MESSAGES.session.droppedOut}
            action={
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
                <Button variant="primary" onClick={() => setHasDroppedOut(false)}>
                  {MESSAGES.session.rejoinCall}
                </Button>
                {/* A patient leaving must not end the session — the physio may
                    still be in it — so they simply go back to their dashboard. */}
                <Button
                  variant="secondary"
                  onClick={() =>
                    isPhysio ? handleEndAndWriteNotes() : void router.replace(ROUTES.dashboardPatient)
                  }
                >
                  {isPhysio ? MESSAGES.session.endSessionInstead : MESSAGES.session.leaveSession}
                </Button>
              </div>
            }
          />
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
            onCallDropped={() => setHasDroppedOut(true)}
            onJoined={() => void startSessionNow()}
          />
        ) : (
          <PreCallScreen
            patientName={counterpartLabel}
            sessionType={sessionSubtitle}
            // The call opens straight away rather than waiting on the request:
            // the physio should never watch a spinner because of bookkeeping,
            // and a start that fails says so on its own.
            onJoin={() => {
              setHasJoined(true)
              void startSessionNow()
            }}
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
          patientId={session.patientId}
          currentSessionId={session.id}
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
