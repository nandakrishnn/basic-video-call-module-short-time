import { Avatar } from '@/components/shared/Avatar'
import { ListRow } from '@/components/shared/ListRow'
import { COLORS, FONT_SIZES } from '@/constants/colors'
import { MESSAGES } from '@/constants/messages'
import type { PatientSummary } from '@/types/user.types'

interface PatientListItemProps {
  patient: PatientSummary
}

export const PatientListItem = ({ patient }: PatientListItemProps): JSX.Element => {
  const contact = [patient.email, patient.phone].filter(Boolean).join(' · ')

  return (
    <ListRow style={{ justifyContent: 'flex-start' }}>
      <Avatar name={patient.fullName} size={38} />
      <div style={{ minWidth: 0 }}>
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
      </div>
    </ListRow>
  )
}
