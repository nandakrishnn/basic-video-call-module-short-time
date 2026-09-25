import { COLORS, FONT_SIZES, RADII } from '@/constants/colors'

type Status = 'scheduled' | 'completed' | 'cancelled' | 'active' | 'missed'

// Foreground and its matching tint are paired explicitly — a CSS variable can't
// be concatenated with an alpha suffix the way a raw hex could.
const STATUS_TONE: Record<Status, { fg: string; bg: string }> = {
  scheduled: { fg: COLORS.status.info, bg: COLORS.statusSoft.info },
  active: { fg: COLORS.status.success, bg: COLORS.statusSoft.success },
  completed: { fg: COLORS.text.secondary, bg: COLORS.surfaceAlt },
  cancelled: { fg: COLORS.status.error, bg: COLORS.statusSoft.error },
  missed: { fg: COLORS.status.warning, bg: COLORS.statusSoft.warning },
}

const FALLBACK_TONE = { fg: COLORS.text.secondary, bg: COLORS.surfaceAlt }

// "scheduled" is the stored value; to a physio reading a list it means the
// session is still ahead. Labelled to match the Bookings filters so the two
// describe the same thing with the same word.
const STATUS_LABEL: Record<Status, string> = {
  scheduled: 'Upcoming',
  active: 'In progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
  missed: 'Missed',
}

interface StatusBadgeProps {
  status: string
}

export const StatusBadge = ({ status }: StatusBadgeProps): JSX.Element => {
  const tone = STATUS_TONE[status as Status] ?? FALLBACK_TONE

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '3px 10px',
        borderRadius: RADII.pill,
        background: tone.bg,
        color: tone.fg,
        fontSize: FONT_SIZES.xs,
        fontWeight: 700,
        textTransform: 'capitalize',
      }}
    >
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: tone.fg }} />
      {STATUS_LABEL[status as Status] ?? status}
    </span>
  )
}
