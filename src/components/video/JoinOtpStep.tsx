import { useEffect, useState } from 'react'
import { Button } from '@/components/shared/Button'
import { COLORS } from '@/constants/colors'
import { CONFIG } from '@/constants/config'
import { MESSAGES } from '@/constants/messages'
import { OtpInput } from './OtpInput'

interface JoinOtpStepProps {
  otp: string
  onOtpChange: (value: string) => void
  onSubmit: () => void
  isSubmitting: boolean
  /** Masked phone or email the code went to, shown so they know where to look. */
  sentTo?: string
  /** Sends a fresh code to the same identifier. */
  onResend: () => Promise<void>
}

const cooldownMs = CONFIG.otp.resendCooldownSeconds * 1000

export const JoinOtpStep = ({
  otp,
  onOtpChange,
  onSubmit,
  isSubmitting,
  onResend,
  sentTo,
}: JoinOtpStepProps): JSX.Element => {
  const [deadline, setDeadline] = useState(() => Date.now() + cooldownMs)
  const [now, setNow] = useState(() => Date.now())
  const [isResending, setIsResending] = useState(false)
  const [didResend, setDidResend] = useState(false)

  // Counts down against the wall clock rather than by decrementing a number,
  // so a backgrounded tab (this screen is opened straight from a mail app)
  // doesn't leave the timer frozen at whatever it read when it was suspended.
  useEffect(() => {
    const interval = setInterval(() => {
      const tick = Date.now()
      setNow(tick)
      if (tick >= deadline) clearInterval(interval)
    }, 500)
    return () => clearInterval(interval)
  }, [deadline])

  const secondsLeft = Math.max(0, Math.ceil((deadline - now) / 1000))
  const canResend = secondsLeft === 0 && !isResending && !isSubmitting

  const handleResend = async (): Promise<void> => {
    setIsResending(true)
    setDidResend(false)
    await onResend()
    setIsResending(false)
    setDeadline(Date.now() + cooldownMs)
    setNow(Date.now())
    setDidResend(true)
    // The old code stops verifying the moment a new one is issued, so leaving
    // half-typed digits behind would only produce a confusing failure.
    onOtpChange('')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <p style={{ color: COLORS.text.secondary, fontSize: '0.9rem', margin: 0, lineHeight: 1.5 }}>
        {sentTo ? `${MESSAGES.auth.otpSentTo} ${sentTo}` : MESSAGES.auth.otpSentBody}
      </p>
      <OtpInput value={otp} onChange={onOtpChange} />
      <Button variant="primary" fullWidth disabled={otp.length === 0} isLoading={isSubmitting} onClick={onSubmit}>
        {isSubmitting ? 'Verifying…' : 'Verify & Join'}
      </Button>

      {didResend && secondsLeft > 0 && (
        <p role="status" style={{ color: COLORS.status.success, fontSize: '0.8rem', margin: 0, textAlign: 'center' }}>
          {MESSAGES.auth.otpResent}
        </p>
      )}

      {canResend || isResending ? (
        <Button variant="ghost" size="sm" fullWidth isLoading={isResending} onClick={() => void handleResend()}>
          {isResending ? MESSAGES.auth.otpResending : MESSAGES.auth.otpResend}
        </Button>
      ) : (
        <p style={{ color: COLORS.text.muted, fontSize: '0.8rem', margin: 0, textAlign: 'center' }}>
          {MESSAGES.auth.otpResendIn} {secondsLeft}s
        </p>
      )}
    </div>
  )
}
