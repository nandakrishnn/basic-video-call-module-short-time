import { COLORS } from '@/constants/colors'

interface StatCardProps {
  label: string
  value: number
}

export const StatCard = ({ label, value }: StatCardProps): JSX.Element => {
  return (
    <div
      style={{
        flex: 1,
        padding: '18px 20px',
        borderRadius: 14,
        background: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
      }}
    >
      <p
        style={{
          color: COLORS.text.muted,
          fontSize: '0.75rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          margin: 0,
        }}
      >
        {label}
      </p>
      <p style={{ color: COLORS.text.primary, fontSize: '1.6rem', fontWeight: 800, margin: '6px 0 0' }}>{value}</p>
    </div>
  )
}
