import { COLORS } from '@/constants/colors'
import { Logo } from '@/components/shared/Logo'

export const PoweredByBadge = (): JSX.Element => {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 10,
        right: 14,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        opacity: 0.7,
        zIndex: 2,
      }}
    >
      <span style={{ fontSize: '0.68rem', color: COLORS.text.inverse }}>Powered by</span>
      <Logo surface="dark" size="sm" />
    </div>
  )
}
