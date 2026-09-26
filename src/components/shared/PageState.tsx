import { COLORS } from '@/constants/colors'

import type { ReactNode } from 'react'

interface PageStateProps {
  message: string
  tone?: 'loading' | 'error' | 'neutral'
  /** Optional escape hatch, so a stalled wait is never a dead end. */
  action?: ReactNode
}

const TONE_COLOR: Record<NonNullable<PageStateProps['tone']>, string> = {
  loading: COLORS.text.secondary,
  error: COLORS.status.error,
  neutral: COLORS.text.secondary,
}

const spinnerStyle = {
  width: 22,
  height: 22,
  borderRadius: '50%',
  border: `2px solid ${COLORS.border}`,
  borderTopColor: COLORS.primaryLight,
  animation: 'spin 700ms linear infinite',
} as const

export const PageState = ({ message, tone = 'neutral', action }: PageStateProps): JSX.Element => {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 14,
        background: COLORS.background,
      }}
    >
      {tone === 'loading' && <span style={spinnerStyle} aria-hidden="true" />}
      <p
        style={{
          color: TONE_COLOR[tone],
          fontSize: '0.95rem',
          fontWeight: 500,
          margin: 0,
          padding: '0 24px',
          textAlign: 'center',
          maxWidth: 420,
        }}
      >
        {message}
      </p>
      {action}
    </div>
  )
}
