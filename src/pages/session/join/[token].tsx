import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { Card } from '@/components/shared/Card'
import { Logo } from '@/components/shared/Logo'
import { PageState } from '@/components/shared/PageState'
import { JoinChoiceStep } from '@/components/video/JoinChoiceStep'
import { JoinIdentifierStep } from '@/components/video/JoinIdentifierStep'
import { JoinOtpStep } from '@/components/video/JoinOtpStep'
import { COLORS } from '@/constants/colors'
import { MESSAGES } from '@/constants/messages'
import { ROUTES } from '@/constants/routes'
import { requestPatientOtpRequest, verifyPatientOtpRequest } from '@/services/auth.service'
import { getJoinTokenRequest } from '@/services/session.service'
import type { Session } from '@/types/session.types'
import { setToken } from '@/utils/storage'

type Step = 'choice' | 'identifier' | 'otp'

const JoinSessionPage = (): JSX.Element => {
  const router = useRouter()
  const { token } = router.query as { token?: string }

  const [session, setSession] = useState<Session | null>(null)
  const [step, setStep] = useState<Step>('choice')
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

  const handleRequestOtp = async (value: string): Promise<void> => {
    if (!token) return
    setIdentifier(value)
    setIsSubmitting(true)
    setError(null)
    const res = await requestPatientOtpRequest(value, token)
    setIsSubmitting(false)
    if (res.success) setStep('otp')
    else setError(res.message)
  }

  const handleVerifyOtp = async (): Promise<void> => {
    if (!token) return
    setIsSubmitting(true)
    setError(null)
    const res = await verifyPatientOtpRequest(identifier, otp, token)
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
        {step === 'choice' && (
          <JoinChoiceStep
            onLogin={() =>
              void router.push(`${ROUTES.login}?redirect=${encodeURIComponent(ROUTES.session(token ?? ''))}`)
            }
            onGuest={() => setStep('identifier')}
          />
        )}
        {step === 'identifier' && (
          <JoinIdentifierStep onSubmit={(v) => void handleRequestOtp(v)} isSubmitting={isSubmitting} />
        )}
        {step === 'otp' && (
          <JoinOtpStep
            otp={otp}
            onOtpChange={setOtp}
            onSubmit={() => void handleVerifyOtp()}
            isSubmitting={isSubmitting}
          />
        )}
        {error && <p style={{ color: COLORS.status.error, fontSize: '0.85rem', margin: 0 }}>{error}</p>}
      </Card>
    </div>
  )
}

export default JoinSessionPage
