import { Button } from '@/components/shared/Button'
import { Card } from '@/components/shared/Card'
import { Toggle } from '@/components/shared/Toggle'

interface SendToggleProps {
  isEnabled: boolean
  onToggle: (value: boolean) => void
  onConfirm: () => void
  isSending: boolean
}

export const SendToggle = ({ isEnabled, onToggle, onConfirm, isSending }: SendToggleProps): JSX.Element => {
  return (
    <Card style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Toggle checked={isEnabled} onChange={onToggle} label="Send report to patient" />
      <Button variant="primary" isLoading={isSending} onClick={onConfirm}>
        {isSending ? 'Sending…' : 'Finish'}
      </Button>
    </Card>
  )
}
