import { COLORS } from '@/constants/colors'
import { Logo } from '@/components/shared/Logo'

export const PoweredByBadge = (): JSX.Element => {
  return (
    // Hidden below 480px (see globals.css) — on narrow screens the control
    // bar wraps to two rows and its bottom row was overlapping this badge.
    <div
      className="powered-by-badge"
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
