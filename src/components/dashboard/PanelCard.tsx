import type { ReactNode } from 'react'
import { Card } from '@/components/shared/Card'
import { COLORS, FONT_SIZES } from '@/constants/colors'

interface PanelCardProps {
  title: string
  subtitle?: string
  /** Trailing header content — a legend, a total, a control. */
  action?: ReactNode
  children: ReactNode
}

/**
 * A titled content panel — the large rounded surface the reference uses to hold
 * a chart or a list, with the heading sitting inside the card rather than above it.
 */
export const PanelCard = ({ title, subtitle, action, children }: PanelCardProps): JSX.Element => (
  <Card padding={24} elevation="sm">
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 18,
      }}
    >
      <div style={{ minWidth: 0 }}>
        <h2 style={{ color: COLORS.text.primary, fontSize: FONT_SIZES.lg, fontWeight: 700, margin: 0 }}>{title}</h2>
        {subtitle && (
          <p style={{ color: COLORS.text.secondary, fontSize: FONT_SIZES.sm, margin: '4px 0 0' }}>{subtitle}</p>
        )}
      </div>
      {action}
    </div>
    {children}
  </Card>
)
