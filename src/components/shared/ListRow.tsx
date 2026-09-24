import type { CSSProperties, ReactNode } from 'react'
import { COLORS, RADII } from '@/constants/colors'

interface ListRowProps {
  children: ReactNode
  /** Lift on hover — for rows carrying an action. */
  interactive?: boolean
  style?: CSSProperties
}

/**
 * A flat bordered row for use *inside* a PanelCard. Panels already supply the
 * elevated surface, so rows stay shadowless to avoid a card-within-a-card look.
 */
export const ListRow = ({ children, interactive = false, style }: ListRowProps): JSX.Element => (
  <div
    className={interactive ? 'hover-card' : undefined}
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      padding: '12px 14px',
      borderRadius: RADII.md,
      border: `1px solid ${COLORS.border}`,
      background: COLORS.surface,
      ...style,
    }}
  >
    {children}
  </div>
)
