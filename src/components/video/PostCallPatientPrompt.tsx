import { Button } from '@/components/shared/Button'
import { Card } from '@/components/shared/Card'
import { Logo } from '@/components/shared/Logo'
import { COLORS } from '@/constants/colors'
import { MESSAGES } from '@/constants/messages'

interface PostCallPatientPromptProps {
  onGoToDashboard: () => void
}

export const PostCallPatientPrompt = ({ onGoToDashboard }: PostCallPatientPromptProps): JSX.Element => {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: COLORS.background,
        borderRadius: 16,
      }}
    >
      <Card
        elevation="md"
        style={{
          width: '100%',
          maxWidth: 380,
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <Logo surface="light" size="lg" />
        <div>
          <h1 style={{ color: COLORS.text.primary, fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>
            {MESSAGES.session.callEndedTitle}
          </h1>
          <p style={{ color: COLORS.text.secondary, fontSize: '0.9rem', margin: '10px 0 0', lineHeight: 1.5 }}>
            {MESSAGES.session.callEndedPatientBody}
          </p>
          <p style={{ color: COLORS.text.muted, fontSize: '0.82rem', margin: '10px 0 0', lineHeight: 1.5 }}>
            {MESSAGES.session.callEndedPatientLoginBody}
          </p>
        </div>
        <Button variant="primary" fullWidth onClick={onGoToDashboard}>
          {MESSAGES.session.viewDashboardButton}
        </Button>
      </Card>
    </div>
  )
}
