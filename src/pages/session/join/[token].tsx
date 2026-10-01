import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'
import { Card } from '@/components/shared/Card'
import { Logo } from '@/components/shared/Logo'
import { PageState } from '@/components/shared/PageState'
import { JoinIdentifierStep } from '@/components/video/JoinIdentifierStep'
import { JoinOtpStep } from '@/components/video/JoinOtpStep'
import { COLORS } from '@/constants/colors'
import { MESSAGES } from '@/constants/messages'
import { ROUTES } from '@/constants/routes'
import { requestPatientOtpRequest, verifyPatientOtpRequest } from '@/services/auth.service'
import { getJoinTokenRequest } from '@/services/session.service'
import type { Session } from '@/types/session.types'
import { maskIdentifier } from '@/utils/mask'
import { setToken } from '@/utils/storage'

type Step = 'identifier' | 'otp'

const JoinSessionPage = (): JSX.Element => {
  const router = useRouter()
  const { token } = router.query as { token?: string }

  const [session, setSession] = useState<Session | null>(null)
  const [step, setStep] = useState<Step>('identifier')
  const [identifier, setIdentifier] = useState('')
  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return
    getJoinTokenRequest(token)
      .then((res) => {
        if (res.success) setSession(res.data)
        else setError(res.message)
      })
      .finally(() => setIsLoading(false))
  }, [token])

  /**
   * The link already identifies the patient, so the code goes out as soon as
   * the session is known and they land on the input. Nothing was being asked
   * on the way that we did not already have.
   *
   * Guarded by a ref rather than state: an effect can run twice for the same
   * session and each run sends a real code, invalidating the one before it.
   */
  const hasRequestedRef = useRef(false)
  useEffect(() => {
    if (!session?.patientIdentifierHint || hasRequestedRef.current) return
    hasRequestedRef.current = true
    void handleRequestOtp(undefined)
    // handleRequestOtp is redefined every render and would re-send if watched
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.patientIdentifierHint])

  /** `value` is undefined on the join path — the server resolves who it is for. */
  const handleRequestOtp = async (value?: string): Promise<void> => {
    if (!token) return
    setIdentifier(value ?? '')
    setIsSubmitting(true)
    setError(null)
    const res = await requestPatientOtpRequest(value, token)
    setIsSubmitting(false)
    if (res.success) setStep('otp')
    else setError(res.message)
  }

  // Reuses the identifier already captured, so the patient never re-enters it.
  // Kept off isSubmitting so the resend spinner doesn't appear on Verify & Join.
  const handleResendOtp = async (): Promise<void> => {
    if (!token) return
    setError(null)
    // Empty on the join path, where the session identifies the patient — and an
    // empty string fails the schema's min(1), so it has to be dropped entirely.
    const res = await requestPatientOtpRequest(identifier || undefined, token)
    if (!res.success) setError(res.message)
  }

  const handleVerifyOtp = async (): Promise<void> => {
    if (!token) return
    setIsSubmitting(true)
    setError(null)
    const res = await verifyPatientOtpRequest(identifier || undefined, otp, token)
    setIsSubmitting(false)
    if (res.success) {
      setToken(res.data.token)
      void router.push(ROUTES.session(token))
    } else {
      setError(res.message)
    }
  }

  if (isLoading) {
    return <PageState tone="loading" message={MESSAGES.session.connecting} />
  }

  if (error && !session) {
    return <PageState tone="error" message={error} />
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: COLORS.background,
        padding: 20,
      }}
    >
      <Card elevation="md" style={{ width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column', gap: 24 }}>
        <Logo surface="light" size="md" />
        {step === 'identifier' && (
          <JoinIdentifierStep
            onSubmit={(v) => void handleRequestOtp(v)}
            isSubmitting={isSubmitting}
          />
        )}
        {step === 'otp' && (
          <JoinOtpStep
            otp={otp}
            onOtpChange={setOtp}
            onSubmit={() => void handleVerifyOtp()}
            isSubmitting={isSubmitting}
            onResend={handleResendOtp}
            sentTo={session?.patientIdentifierHint ?? (identifier ? maskIdentifier(identifier) : undefined)}
          />
        )}
        {error && <p style={{ color: COLORS.status.error, fontSize: '0.85rem', margin: 0 }}>{error}</p>}
      </Card>
    </div>
  )
}

export default JoinSessionPage
