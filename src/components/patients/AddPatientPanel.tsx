import { useState } from 'react'
import { COLORS } from '@/constants/colors'
import { MESSAGES } from '@/constants/messages'
import { createPatientRequest } from '@/services/patient.service'

interface AddPatientPanelProps {
  token: string
}

const fieldStyle = {
  padding: '10px 12px',
  borderRadius: 8,
  border: `1px solid ${COLORS.border}`,
  color: COLORS.text.primary,
}
const labelStyle = { fontSize: '0.78rem', fontWeight: 600, color: COLORS.text.primary }

export const AddPatientPanel = ({ token }: AddPatientPanelProps): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSave = async (): Promise<void> => {
    if (!name || (!email && !phone)) {
      setError(MESSAGES.newCall.missingContact)
      return
    }

    setIsSubmitting(true)
    setError(null)
    const res = await createPatientRequest(token, {
      fullName: name,
      email: email || undefined,
      phone: phone || undefined,
    })
    setIsSubmitting(false)

    if (!res.success) {
      setError(MESSAGES.newCall.createPatientFailed)
      return
    }

    setSuccess(true)
    setName('')
    setEmail('')
    setPhone('')
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => {
          setIsOpen(true)
          setSuccess(false)
        }}
        style={{
          alignSelf: 'flex-start',
          padding: '10px 20px',
          borderRadius: 10,
          border: `1px solid ${COLORS.border}`,
          background: 'none',
          color: COLORS.primary,
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        Add Patient
      </button>
    )
  }

  return (
    <div
      style={{
        padding: 20,
        borderRadius: 14,
        background: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        maxWidth: 380,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ color: COLORS.text.primary, fontSize: '1rem', fontWeight: 700, margin: 0 }}>
          {MESSAGES.newCall.addPatientTitle}
        </h2>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          style={{ border: 'none', background: 'none', color: COLORS.text.muted, cursor: 'pointer' }}
        >
          ✕
        </button>
      </div>

      {success && (
        <p style={{ color: COLORS.status.success, fontSize: '0.85rem', margin: 0 }}>Patient added successfully.</p>
      )}

      <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={labelStyle}>Full name</span>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={fieldStyle} />
      </label>
      <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={labelStyle}>Email</span>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={fieldStyle} />
      </label>
      <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={labelStyle}>Phone</span>
        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} style={fieldStyle} />
      </label>

      {error && <p style={{ color: COLORS.status.error, fontSize: '0.85rem', margin: 0 }}>{error}</p>}

      <button
        type="button"
        disabled={isSubmitting}
        onClick={() => void handleSave()}
        style={{
          padding: '10px',
          borderRadius: 10,
          border: 'none',
          background: COLORS.primary,
          color: COLORS.text.inverse,
          fontWeight: 700,
          cursor: isSubmitting ? 'default' : 'pointer',
          opacity: isSubmitting ? 0.7 : 1,
        }}
      >
        {isSubmitting ? 'Saving…' : 'Save patient'}
      </button>
    </div>
  )
}
