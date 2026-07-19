import { Button } from '@/components/shared/Button'
import { COLORS } from '@/constants/colors'
import { MESSAGES } from '@/constants/messages'

interface JoinChoiceStepProps {
  onLogin: () => void
  onGuest: () => void
}

export const JoinChoiceStep = ({ onLogin, onGuest }: JoinChoiceStepProps): JSX.Element => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        <h1 style={{ color: COLORS.text.primary, fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>
          {MESSAGES.session.joinChoiceTitle}
        </h1>
        <p style={{ color: COLORS.text.secondary, fontSize: '0.9rem', margin: '6px 0 0', lineHeight: 1.5 }}>
          {MESSAGES.session.joinChoiceBody}
        </p>
      </div>
      <Button variant="primary" fullWidth onClick={onLogin}>
        {MESSAGES.session.loginOption}
      </Button>
      <Button variant="secondary" fullWidth onClick={onGuest}>
        {MESSAGES.session.guestOption}
      </Button>
    </div>
  )
}
