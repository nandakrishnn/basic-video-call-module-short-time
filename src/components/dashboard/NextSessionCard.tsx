import { Video } from 'lucide-react'
import { Avatar } from '@/components/shared/Avatar'
import { Button } from '@/components/shared/Button'
import { COLORS, FONT_SIZES, RADII } from '@/constants/colors'
import { MESSAGES } from '@/constants/messages'
import type { Appointment } from '@/types/appointment.types'
import type { PatientSummary } from '@/types/user.types'
import { parseUtc } from '@/utils/date'

interface NextSessionCardProps {
  appointment: Appointment
  patient?: PatientSummary
  sessionTypeLabel: string
  isStarting: boolean
  onStart: () => void
}

export const NextSessionCard = ({
  appointment,
  patient,
  sessionTypeLabel,
  isStarting,
  onStart,
}: NextSessionCardProps): JSX.Element => {
  const at = parseUtc(appointment.scheduledAt)
  const name = patient?.fullName ?? MESSAGES.appointments.unknownPatient
  const issue = patient?.issue?.trim()

  return (
    <section
      style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 20,
        padding: '20px 24px',
        borderRadius: RADII.lg,
        border: `1px solid ${COLORS.border}`,
        background: COLORS.surface,
      }}
    >
      <div style={{ minWidth: 0 }}>
        <p
          style={{
            color: COLORS.primaryStrong,
            fontSize: FONT_SIZES.sm,
            fontWeight: 700,
            margin: 0,
          }}
        >
          {MESSAGES.dashboard.nextSession}
        </p>
        <p
          style={{
            color: COLORS.text.primary,
            fontSize: FONT_SIZES['2xl'],
            fontWeight: 800,
            margin: '2px 0 0',
            lineHeight: 1.15,
          }}
        >
          {at.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
        <p style={{ color: COLORS.text.secondary, fontSize: FONT_SIZES.base, margin: '3px 0 0' }}>
          {at.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
        </p>
      </div>

      <div className="next-session-divider" />

      <div style={{ display: 'flex', alignItems: 'center', gap: 13, flex: '1 1 220px', minWidth: 0 }}>
        <Avatar name={name} size={46} />
        <div style={{ minWidth: 0 }}>
          <p style={{ color: COLORS.text.primary, fontSize: FONT_SIZES.lg, fontWeight: 700, margin: 0 }}>{name}</p>
          {patient?.phone && (
            <p style={{ color: COLORS.text.secondary, fontSize: FONT_SIZES.base, margin: '2px 0 0' }}>
              {patient.phone}
            </p>
          )}
          <p style={{ color: COLORS.text.secondary, fontSize: FONT_SIZES.sm, margin: '2px 0 0' }}>
            {issue ? `${issue} · ${sessionTypeLabel}` : sessionTypeLabel}
          </p>
        </div>
      </div>

      <Button variant="primary" isLoading={isStarting} onClick={onStart} style={{ padding: '14px 26px' }}>
        <Video size={17} />
        {MESSAGES.dashboard.startSession}
      </Button>
    </section>
  )
}
