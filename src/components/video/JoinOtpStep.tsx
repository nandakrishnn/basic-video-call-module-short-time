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
    <>
      <p style={{ color: COLORS.text.secondary, fontSize: '0.9rem', marginBottom: 16 }}>
        {MESSAGES.auth.otpSentBody}
      </p>
      <div style={{ marginBottom: 16 }}>
        <OtpInput value={otp} onChange={onOtpChange} />
      </div>
      <button
        type="button"
        disabled={isSubmitting || otp.length === 0}
        onClick={onSubmit}
        style={{
          width: '100%',
          padding: '12px',
          borderRadius: 10,
          border: 'none',
          background: COLORS.primary,
          color: COLORS.text.inverse,
          fontWeight: 700,
          cursor: isSubmitting ? 'default' : 'pointer',
          opacity: isSubmitting ? 0.7 : 1,
        }}
      >
        {isSubmitting ? 'Verifying…' : 'Verify & Join'}
      </button>
    </>
  )
}
