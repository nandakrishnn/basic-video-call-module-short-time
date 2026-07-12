import { COLORS } from '@/constants/colors'

interface EmptyStateProps {
  message: string
}

export const EmptyState = ({ message }: EmptyStateProps): JSX.Element => {
  return (
    <p style={{ color: COLORS.text.muted, fontSize: '0.88rem', padding: '24px 0', textAlign: 'center' }}>
      {message}
    </p>
  )
}
