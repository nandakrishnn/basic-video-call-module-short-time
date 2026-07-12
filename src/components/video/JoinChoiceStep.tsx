import { COLORS } from '@/constants/colors'
import { MESSAGES } from '@/constants/messages'

interface JoinChoiceStepProps {
  onLogin: () => void
  onGuest: () => void
}

export const JoinChoiceStep = ({ onLogin, onGuest }: JoinChoiceStepProps): JSX.Element => {
  return (
    <>
      <h1 style={{ color: COLORS.text.primary, fontSize: '1.2rem', fontWeight: 800 }}>
        {MESSAGES.session.joinChoiceTitle}
      </h1>
      <p style={{ color: COLORS.text.secondary, fontSize: '0.9rem', marginBottom: 24 }}>
        {MESSAGES.session.joinChoiceBody}
      </p>
      <button
        type="button"
        onClick={onLogin}
        style={{
          width: '100%',
          padding: '12px',
          marginBottom: 12,
          borderRadius: 10,
          border: 'none',
          background: COLORS.primary,
          color: COLORS.text.inverse,
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        {MESSAGES.session.loginOption}
      </button>
      <button
        type="button"
        onClick={onGuest}
        style={{
          width: '100%',
          padding: '12px',
          borderRadius: 10,
          border: `1px solid ${COLORS.border}`,
          background: COLORS.background,
          color: COLORS.text.primary,
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        {MESSAGES.session.guestOption}
      </button>
    </>
  )
}
