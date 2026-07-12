import { COLORS } from '@/constants/colors'

interface CallTimerProps {
  formattedTime: string
}

export const CallTimer = ({ formattedTime }: CallTimerProps): JSX.Element => {
  return (
    <span style={{ color: COLORS.text.inverse, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
      {formattedTime}
    </span>
  )
}
