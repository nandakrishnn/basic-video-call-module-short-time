import { COLORS, FONT_SIZES } from '@/constants/colors'

interface CallTimerProps {
  formattedTime: string
}

export const CallTimer = ({ formattedTime }: CallTimerProps): JSX.Element => {
  return (
    <span
      style={{
        color: COLORS.text.primary,
        fontSize: FONT_SIZES.md,
        fontWeight: 700,
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {formattedTime}
    </span>
  )
}
