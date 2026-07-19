import { Input } from '@/components/shared/Input'
import { CONFIG } from '@/constants/config'

interface OtpInputProps {
  value: string
  onChange: (value: string) => void
}

export const OtpInput = ({ value, onChange }: OtpInputProps): JSX.Element => {
  return (
    <Input
      type="text"
      inputMode="numeric"
      maxLength={CONFIG.otp.length}
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, ''))}
      style={{ fontSize: '1.4rem', letterSpacing: '0.4em', textAlign: 'center' }}
      aria-label="One-time verification code"
    />
  )
}
