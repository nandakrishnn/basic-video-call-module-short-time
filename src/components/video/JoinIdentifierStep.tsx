import { useState } from 'react'
import { Button } from '@/components/shared/Button'
import { Input } from '@/components/shared/Input'

interface JoinIdentifierStepProps {
  onSubmit: (identifier: string) => void
  isSubmitting: boolean
}

export const JoinIdentifierStep = ({ onSubmit, isSubmitting }: JoinIdentifierStepProps): JSX.Element => {
  const [identifier, setIdentifier] = useState('')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Input
        type="text"
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
        placeholder="Email or phone number"
      />
      <Button
        variant="primary"
        fullWidth
        disabled={!identifier}
        isLoading={isSubmitting}
        onClick={() => onSubmit(identifier)}
      >
        {isSubmitting ? 'Sending…' : 'Send Code'}
      </Button>
    </div>
  )
}
