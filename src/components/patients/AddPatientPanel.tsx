import { X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/shared/Button'
import { Card } from '@/components/shared/Card'
import { Input } from '@/components/shared/Input'
import { COLORS } from '@/constants/colors'
import { MESSAGES } from '@/constants/messages'
import { createPatientRequest } from '@/services/patient.service'
import type { User } from '@/types/user.types'

interface AddPatientPanelProps {
  token: string
  onPatientAdded?: (patient: User) => void
}

const labelStyle = { fontSize: '0.78rem', fontWeight: 600, color: COLORS.text.primary }

export const AddPatientPanel = ({ token, onPatientAdded }: AddPatientPanelProps): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSave = async (): Promise<void> => {
    if (!name || !email || !phone) {
      setError(MESSAGES.newCall.missingContact)
      return
    }

    setIsSubmitting(true)
    setError(null)
    const res = await createPatientRequest(token, { fullName: name, email, phone })
    setIsSubmitting(false)

    if (!res.success) {
      setError(MESSAGES.newCall.createPatientFailed)
      return
    }

    setSuccess(true)
    setName('')
    setEmail('')
    setPhone('')
    onPatientAdded?.(res.data)
  }

  if (!isOpen) {
    return (
      <Button
        variant="secondary"
        onClick={() => {
          setIsOpen(true)
          setSuccess(false)
        }}
        style={{ alignSelf: 'flex-start' }}
      >
        Add Patient
      </Button>
    )
  }

  return (
    <Card style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 380 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ color: COLORS.text.primary, fontSize: '1rem', fontWeight: 700, margin: 0 }}>
          {MESSAGES.newCall.addPatientTitle}
        </h2>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          aria-label="Close"
          style={{
            border: 'none',
            background: 'none',
            color: COLORS.text.muted,
            cursor: 'pointer',
            display: 'flex',
            padding: 12,
          }}
        >
          <X size={16} />
        </button>
      </div>

      {success && (
        <p style={{ color: COLORS.status.success, fontSize: '0.85rem', margin: 0 }}>Patient added successfully.</p>
      )}

      <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={labelStyle}>Full name</span>
        <Input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
      </label>
      <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={labelStyle}>Email</span>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </label>
      <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={labelStyle}>Phone</span>
        <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
      </label>

      {error && <p style={{ color: COLORS.status.error, fontSize: '0.85rem', margin: 0 }}>{error}</p>}

      <Button variant="primary" fullWidth isLoading={isSubmitting} onClick={() => void handleSave()}>
        {isSubmitting ? 'Saving…' : 'Save patient'}
      </Button>
    </Card>
  )
}
