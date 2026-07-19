import { COLORS, RADII } from '@/constants/colors'

type Status = 'scheduled' | 'completed' | 'cancelled' | 'active'

const STATUS_COLOR: Record<Status, string> = {
  scheduled: COLORS.status.info,
  active: COLORS.status.success,
  completed: COLORS.text.muted,
  cancelled: COLORS.status.error,
}

interface StatusBadgeProps {
  status: string
}

export const StatusBadge = ({ status }: StatusBadgeProps): JSX.Element => {
  const color = STATUS_COLOR[status as Status] ?? COLORS.text.muted

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '2px 10px',
        borderRadius: RADII.pill,
        background: `${color}1A`,
        color,
        fontSize: '0.7rem',
        fontWeight: 700,
        textTransform: 'capitalize',
      }}
    >
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: color }} />
      {status}
    </span>
  )
}
