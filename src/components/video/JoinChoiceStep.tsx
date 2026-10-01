import { LayoutDashboard, Video } from 'lucide-react'
import { Button } from '@/components/shared/Button'
import { COLORS } from '@/constants/colors'
import { MESSAGES } from '@/constants/messages'

interface JoinChoiceStepProps {
  onJoinCall: () => void
  onViewDashboard: () => void
  /** Both buttons send the code, so both wait on it. */
  isSubmitting: boolean
}

/**
 * Both routes verify the same way — a one-time code — so the choice is only
 * where the patient lands. It used to offer "log in to your account", which
 * sent them to the physio's email-and-password form; patients have no password,
 * so that path could never work for them.
 */
export const JoinChoiceStep = ({ onJoinCall, onViewDashboard, isSubmitting }: JoinChoiceStepProps): JSX.Element => {
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
      <Button variant="primary" fullWidth isLoading={isSubmitting} onClick={onJoinCall}>
        <Video size={16} />
        {MESSAGES.session.joinCallOption}
      </Button>
      <Button variant="secondary" fullWidth disabled={isSubmitting} onClick={onViewDashboard}>
        <LayoutDashboard size={16} />
        {MESSAGES.session.dashboardOption}
      </Button>
    </div>
  )
}
