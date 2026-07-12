import { COLORS } from '@/constants/colors'
import { CONFIG } from '@/constants/config'

interface OtpInputProps {
  value: string
  onChange: (value: string) => void
}

export const OtpInput = ({ value, onChange }: OtpInputProps): JSX.Element => {
  return (
    <input
      type="text"
      inputMode="numeric"
      maxLength={CONFIG.otp.length}
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, ''))}
      style={{
        width: '100%',
        padding: '12px 16px',
        fontSize: '1.4rem',
        letterSpacing: '0.4em',
        textAlign: 'center',
        borderRadius: 10,
        border: `1px solid ${COLORS.border}`,
        color: COLORS.text.primary,
      }}
      aria-label="One-time verification code"
    />
  )
}
