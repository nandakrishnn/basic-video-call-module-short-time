import type { ReactNode } from 'react'
import { COLORS, FONT_SIZES } from '@/constants/colors'

interface SectionHeadingProps {
  title: string
  /** Optional trailing content — a count, a link, a filter. */
  action?: ReactNode
}

export const SectionHeading = ({ title, action }: SectionHeadingProps): JSX.Element => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      marginBottom: 14,
    }}
  >
    <h2 style={{ color: COLORS.text.primary, fontSize: FONT_SIZES.lg, fontWeight: 700, margin: 0 }}>{title}</h2>
    {action}
  </div>
)

/** Uppercase micro-label used to group rows, as in the reference session plan. */
export const GroupLabel = ({ children }: { children: ReactNode }): JSX.Element => (
  <span
    style={{
      color: COLORS.text.muted,
      fontSize: FONT_SIZES.xs,
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
    }}
  >
    {children}
  </span>
)
