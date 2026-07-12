import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { PhysioSessionPanel } from '@/components/video/PhysioSessionPanel'
import { VideoStage } from '@/components/video/VideoStage'
import { COLORS } from '@/constants/colors'
import { MESSAGES } from '@/constants/messages'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/hooks/useAuth'
import { endSessionRequest, getSessionRequest, startSessionRequest } from '@/services/session.service'
import type { Session } from '@/types/session.types'
import { getToken } from '@/utils/storage'

const SessionPage = (): JSX.Element => {
  const router = useRouter()
  const { sessionId } = router.query as { sessionId?: string }
  const { user, isLoading: isAuthLoading } = useAuth()

  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
    endSessionRequest(token, sessionId).then(() => {
      if (user?.role === 'physio') void router.push(ROUTES.dashboardPhysio)
    })
  }

  if (isLoading || isAuthLoading) {
    return <div style={{ padding: 40, color: COLORS.text.secondary }}>{MESSAGES.session.connecting}</div>
  }

  if (error || !session) {
    return <div style={{ padding: 40, color: COLORS.status.error }}>{error ?? MESSAGES.session.notYetActive}</div>
  }

  if (session.status === 'completed' || session.status === 'cancelled') {
    return <div style={{ padding: 40, color: COLORS.text.secondary }}>{MESSAGES.session.ended}</div>
  }

  const isPhysio = user?.role === 'physio'

  return (
    <div style={{ display: 'flex', gap: 16, height: '100vh', padding: 16, background: COLORS.background }}>
      <div style={{ flex: 1 }}>
        <VideoStage
          roomName={session.roomName}
          displayName={user?.fullName ?? 'Guest'}
          patientName="Patient"
          sessionType="Follow-up"
          onCallEnded={handleCallEnded}
        />
      </div>
      {isPhysio && (
        <PhysioSessionPanel
          patientName="Patient"
          patientAge={null}
          sessionNumber={1}
          scheduledAt={session.startedAt ?? ''}
          actualStartAt={session.startedAt}
          onQuickNote={() => {}}
          onEndCallAndWriteNotes={handleCallEnded}
        />
      )}
    </div>
  )
}

export default SessionPage
