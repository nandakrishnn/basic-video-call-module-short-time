import { useState } from 'react'
import { Button } from '@/components/shared/Button'
import { Textarea } from '@/components/shared/Input'
import { Modal } from '@/components/shared/Modal'
import { COLORS } from '@/constants/colors'

interface QuickNoteModalProps {
  initialValue: string
  onSave: (value: string) => void
  onClose: () => void
}

export const QuickNoteModal = ({ initialValue, onSave, onClose }: QuickNoteModalProps): JSX.Element => {
  const [value, setValue] = useState(initialValue)

  return (
    <Modal onOverlayClick={onClose} maxWidth={420}>
      <h3 style={{ color: COLORS.text.primary, fontSize: '1.1rem', fontWeight: 700, margin: '0 0 4px' }}>
        Quick note
      </h3>
      <p style={{ color: COLORS.text.secondary, fontSize: '0.85rem', margin: '0 0 16px' }}>
        Jot something down without leaving the call — it'll be waiting for you when you write up the full notes.
      </p>
      <Textarea
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="e.g. Reduced pain on left knee flexion, check ROM next session…"
        rows={6}
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={() => {
            onSave(value)
            onClose()
          }}
        >
          Save
        </Button>
      </div>
    </Modal>
  )
}
