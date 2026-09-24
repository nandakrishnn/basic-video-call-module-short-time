import type { CSSProperties, HTMLAttributes } from 'react'
import { COLORS, RADII, SHADOWS } from '@/constants/colors'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: number
  elevation?: 'sm' | 'md' | 'lg'
  radius?: 'md' | 'lg' | 'xl'
  /** Lift the card slightly on hover — for rows that are clickable or actionable. */
  interactive?: boolean
}

export const Card = ({
  padding = 20,
  elevation = 'sm',
  radius = 'lg',
  interactive = false,
  className,
  style,
  children,
  ...rest
}: CardProps): JSX.Element => {
  const cardStyle: CSSProperties = {
    background: COLORS.surface,
    border: `1px solid ${COLORS.border}`,
    borderRadius: RADII[radius],
    boxShadow: SHADOWS[elevation],
    padding,
    ...style,
  }

  return (
    <div
      className={[interactive ? 'hover-card' : '', className ?? ''].filter(Boolean).join(' ') || undefined}
      style={cardStyle}
      {...rest}
    >
      {children}
    </div>
  )
}
