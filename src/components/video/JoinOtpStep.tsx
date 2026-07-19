import { Button } from '@/components/shared/Button'
import { COLORS } from '@/constants/colors'
import { MESSAGES } from '@/constants/messages'
import { OtpInput } from './OtpInput'

interface JoinOtpStepProps {
  otp: string
  onOtpChange: (value: string) => void
  onSubmit: () => void
  isSubmitting: boolean
}

export const JoinOtpStep = ({ otp, onOtpChange, onSubmit, isSubmitting }: JoinOtpStepProps): JSX.Element => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <p style={{ color: COLORS.text.secondary, fontSize: '0.9rem', margin: 0, lineHeight: 1.5 }}>
        {MESSAGES.auth.otpSentBody}
      </p>
      <OtpInput value={otp} onChange={onOtpChange} />
      <Button variant="primary" fullWidth disabled={otp.length === 0} isLoading={isSubmitting} onClick={onSubmit}>
        {isSubmitting ? 'Verifying…' : 'Verify & Join'}
      </Button>
    </div>
  )
}
