import type { CSSProperties, ReactNode } from 'react'
import { COLORS, RADII } from '@/constants/colors'

interface ListRowProps {
  children: ReactNode
  /** Lift on hover — for rows carrying an action. */
  interactive?: boolean
  /** Makes the whole row activate. Rendered as a button so it is keyboard-reachable. */
  onClick?: () => void
  style?: CSSProperties
}

/**
 * A flat bordered row for use *inside* a PanelCard. Panels already supply the
 * elevated surface, so rows stay shadowless to avoid a card-within-a-card look.
 */
export const ListRow = ({ children, interactive = false, onClick, style }: ListRowProps): JSX.Element => {
  const shell: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    padding: '12px 14px',
    borderRadius: RADII.md,
    border: `1px solid ${COLORS.border}`,
    background: COLORS.surface,
    ...style,
  }

  // A clickable row is a real button, not a div with a handler — otherwise it
  // is unreachable by keyboard and invisible to assistive tech.
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={interactive ? 'hover-card' : undefined}
        style={{ ...shell, width: '100%', textAlign: 'left', cursor: 'pointer', font: 'inherit' }}
      >
        {children}
      </button>
    )
  }

  return (
    <div className={interactive ? 'hover-card' : undefined} style={shell}>
      {children}
    </div>
  )
}
