import type { ReactNode } from 'react'
import { Card } from '@/components/shared/Card'
import { COLORS, FONT_SIZES, RADII } from '@/constants/colors'

interface StatCardProps {
  label: string
  value: number
  icon?: ReactNode
}

export const StatCard = ({ label, value, icon }: StatCardProps): JSX.Element => {
  return (
    <Card padding={22} style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 0 }}>
      {icon && (
        <div
          style={{
            width: 46,
            height: 46,
            borderRadius: RADII.md,
            background: COLORS.primarySoft,
            color: COLORS.primaryStrong,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
      )}
      <div style={{ minWidth: 0 }}>
        <p
          style={{
            color: COLORS.text.muted,
            fontSize: FONT_SIZES.xs,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            margin: 0,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {label}
        </p>
        <p
          style={{
            color: COLORS.text.primary,
            fontSize: FONT_SIZES['2xl'],
            fontWeight: 800,
            margin: '2px 0 0',
            lineHeight: 1.1,
          }}
        >
          {value}
        </p>
      </div>
    </Card>
  )
}
