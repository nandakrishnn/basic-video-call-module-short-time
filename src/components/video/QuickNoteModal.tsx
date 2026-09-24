import { useState } from 'react'
import { Button } from '@/components/shared/Button'
import { Textarea } from '@/components/shared/Input'
import { Modal } from '@/components/shared/Modal'
import { MESSAGES } from '@/constants/messages'

interface QuickNoteModalProps {
  initialValue: string
  onSave: (value: string) => void
  onClose: () => void
}

export const QuickNoteModal = ({ initialValue, onSave, onClose }: QuickNoteModalProps): JSX.Element => {
  const [value, setValue] = useState(initialValue)

  return (
    <Modal
      title="Quick note"
      subtitle="Jot something down without leaving the call — it'll be waiting for you when you write up the full notes."
      maxWidth={440}
      onClose={onClose}
      footer={
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="secondary" onClick={onClose} style={{ flex: 1 }}>
            {MESSAGES.common.cancel}
          </Button>
          <Button
            variant="primary"
            style={{ flex: 2 }}
            onClick={() => {
              onSave(value)
              onClose()
            }}
          >
            Save
          </Button>
        </div>
      }
    >
      <Textarea
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="e.g. Reduced pain on left knee flexion, check ROM next session…"
        rows={6}
      />
    </Modal>
  )
}
