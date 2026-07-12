import { COLORS } from '@/constants/colors'
import { MESSAGES } from '@/constants/messages'

export const PoweredByBadge = (): JSX.Element => {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 8,
        right: 12,
        fontSize: '0.7rem',
        color: COLORS.text.inverse,
        opacity: 0.6,
        zIndex: 2,
      }}
    >
      {MESSAGES.session.poweredBy}
    </div>
  )
}
