import type { CSSProperties, HTMLAttributes } from 'react'
import { COLORS, RADII, SHADOWS } from '@/constants/colors'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: number
  elevation?: 'sm' | 'md' | 'lg'
}

export const Card = ({ padding = 20, elevation = 'sm', style, children, ...rest }: CardProps): JSX.Element => {
  const cardStyle: CSSProperties = {
    background: COLORS.surface,
    border: `1px solid ${COLORS.border}`,
    borderRadius: RADII.md,
    boxShadow: SHADOWS[elevation],
    padding,
    ...style,
  }

  return (
    <div style={cardStyle} {...rest}>
      {children}
    </div>
  )
}
