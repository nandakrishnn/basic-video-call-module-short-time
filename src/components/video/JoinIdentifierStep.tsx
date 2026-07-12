import { useState } from 'react'
import { COLORS } from '@/constants/colors'

interface JoinIdentifierStepProps {
  onSubmit: (identifier: string) => void
  isSubmitting: boolean
}

export const JoinIdentifierStep = ({ onSubmit, isSubmitting }: JoinIdentifierStepProps): JSX.Element => {
  const [identifier, setIdentifier] = useState('')

  return (
    <>
      <input
        type="text"
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
        placeholder="Email or phone number"
        style={{
          width: '100%',
          padding: '12px 16px',
          borderRadius: 10,
          border: `1px solid ${COLORS.border}`,
          marginBottom: 16,
          color: COLORS.text.primary,
        }}
      />
      <button
        type="button"
        disabled={isSubmitting || !identifier}
        onClick={() => onSubmit(identifier)}
        style={{
          width: '100%',
          padding: '12px',
          borderRadius: 10,
          border: 'none',
          background: COLORS.primary,
          color: COLORS.text.inverse,
          fontWeight: 700,
          cursor: isSubmitting ? 'default' : 'pointer',
          opacity: isSubmitting ? 0.7 : 1,
        }}
      >
        {isSubmitting ? 'Sending…' : 'Send Code'}
      </button>
    </>
  )
}
