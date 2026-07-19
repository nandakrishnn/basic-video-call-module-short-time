import type { ReactNode } from 'react'
import { Card } from '@/components/shared/Card'
import { COLORS, RADII } from '@/constants/colors'

interface StatCardProps {
  label: string
  value: number
  icon?: ReactNode
}

export const StatCard = ({ label, value, icon }: StatCardProps): JSX.Element => {
  return (
    <Card style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 14 }}>
      {icon && (
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: RADII.sm,
            background: 'rgba(0,113,227,0.1)',
            color: COLORS.primaryLight,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
      )}
      <div>
        <p
          style={{
            color: COLORS.text.muted,
            fontSize: '0.72rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: 0.4,
            margin: 0,
          }}
        >
          {label}
        </p>
        <p style={{ color: COLORS.text.primary, fontSize: '1.7rem', fontWeight: 800, margin: '2px 0 0' }}>{value}</p>
      </div>
    </Card>
  )
}
