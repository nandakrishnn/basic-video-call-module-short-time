import { ChevronRight } from 'lucide-react'
import { Avatar } from '@/components/shared/Avatar'
import { ListRow } from '@/components/shared/ListRow'
import { COLORS, FONT_SIZES, RADII } from '@/constants/colors'
import { MESSAGES } from '@/constants/messages'
import type { PatientSummary } from '@/types/user.types'

interface PatientListItemProps {
  patient: PatientSummary
  /** Makes the row open the patient. Omit to render it read-only. */
  onOpen?: () => void
}

export const PatientListItem = ({ patient, onOpen }: PatientListItemProps): JSX.Element => {
  const contact = [patient.email, patient.phone].filter(Boolean).join(' · ')
  const issue = patient.issue?.trim()

  return (
    <ListRow style={{ justifyContent: 'flex-start' }} interactive={Boolean(onOpen)} onClick={onOpen}>
      <Avatar name={patient.fullName} size={38} />
      <div style={{ minWidth: 0, flex: 1 }}>
        <p style={{ color: COLORS.text.primary, fontWeight: 700, fontSize: FONT_SIZES.base, margin: 0 }}>
          {patient.fullName}
        </p>
        <p
          title={contact || undefined}
          style={{
            color: COLORS.text.secondary,
            fontSize: FONT_SIZES.sm,
            margin: '2px 0 0',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {contact || MESSAGES.dashboard.noContactInfo}
        </p>
        {issue && (
          <span
            style={{
              display: 'inline-block',
              margin: '7px 0 0',
              padding: '3px 9px',
              borderRadius: RADII.pill,
              background: COLORS.primarySoft,
              color: COLORS.primaryStrong,
              fontSize: FONT_SIZES.xs,
              fontWeight: 700,
            }}
          >
            {issue}
          </span>
        )}
      </div>
      {onOpen && <ChevronRight size={17} color={COLORS.text.muted} style={{ flexShrink: 0 }} />}
    </ListRow>
  )
}
