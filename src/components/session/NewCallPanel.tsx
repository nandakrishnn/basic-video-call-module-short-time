import { useRouter } from 'next/router'
import { useState } from 'react'
import { COLORS } from '@/constants/colors'
import { MESSAGES } from '@/constants/messages'
import { ROUTES } from '@/constants/routes'
import { createPatientRequest, listPatientsRequest } from '@/services/patient.service'
import { createSessionRequest } from '@/services/session.service'
import type { User } from '@/types/user.types'

interface NewCallPanelProps {
  token: string
}

const fieldStyle = {
  padding: '10px 12px',
  borderRadius: 8,
  border: `1px solid ${COLORS.border}`,
  color: COLORS.text.primary,
}
const labelStyle = { fontSize: '0.78rem', fontWeight: 600, color: COLORS.text.primary }

export const NewCallPanel = ({ token }: NewCallPanelProps): JSX.Element => {
  const router = useRouter()

  const [isOpen, setIsOpen] = useState(false)
  const [patients, setPatients] = useState<User[]>([])
  const [isLoadingPatients, setIsLoadingPatients] = useState(false)
  const [selectedPatientId, setSelectedPatientId] = useState('')

  const [isAddingPatient, setIsAddingPatient] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPhone, setNewPhone] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleOpen = async (): Promise<void> => {
    setIsOpen(true)
    setIsLoadingPatients(true)
    const res = await listPatientsRequest(token)
    if (res.success) setPatients(res.data)
    setIsLoadingPatients(false)
  }

  const handleAddPatient = async (): Promise<void> => {
    if (!newName || (!newEmail && !newPhone)) {
      setError(MESSAGES.newCall.missingContact)
      return
    }

    setIsSubmitting(true)
    setError(null)
    const res = await createPatientRequest(token, {
      fullName: newName,
      email: newEmail || undefined,
      phone: newPhone || undefined,
    })
    setIsSubmitting(false)

    if (!res.success) {
      setError(MESSAGES.newCall.createPatientFailed)
      return
    }

    setPatients((prev) => [...prev, res.data])
    setSelectedPatientId(res.data.id)
    setIsAddingPatient(false)
    setNewName('')
    setNewEmail('')
    setNewPhone('')
  }

  const handleStartCall = async (): Promise<void> => {
    if (!selectedPatientId) return

    setIsSubmitting(true)
    setError(null)
    const res = await createSessionRequest(token, selectedPatientId)
    setIsSubmitting(false)

    if (res.success) void router.push(ROUTES.session(res.data.id))
    else setError(res.message)
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => void handleOpen()}
        style={{
          alignSelf: 'flex-start',
          padding: '10px 20px',
          borderRadius: 10,
          border: 'none',
          background: COLORS.primary,
          color: COLORS.text.inverse,
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        {MESSAGES.newCall.button}
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
        gap: 14,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ color: COLORS.text.primary, fontSize: '1rem', fontWeight: 700, margin: 0 }}>
          {MESSAGES.newCall.button}
        </h2>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          style={{ border: 'none', background: 'none', color: COLORS.text.muted, cursor: 'pointer' }}
        >
          ✕
        </button>
      </div>

      <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={labelStyle}>{MESSAGES.newCall.selectPatient}</span>
        <select
          value={selectedPatientId}
          onChange={(e) => setSelectedPatientId(e.target.value)}
          disabled={isLoadingPatients}
          style={fieldStyle}
        >
          <option value="">{isLoadingPatients ? 'Loading…' : '— Select —'}</option>
          {patients.map((patient) => (
            <option key={patient.id} value={patient.id}>
              {patient.fullName} ({patient.email ?? patient.phone})
            </option>
          ))}
        </select>
      </label>

      {isAddingPatient ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            padding: 14,
            borderRadius: 10,
            background: COLORS.background,
          }}
        >
          <span style={labelStyle}>{MESSAGES.newCall.addPatientTitle}</span>
          <input
            type="text"
            placeholder="Full name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            style={fieldStyle}
          />
          <input
            type="email"
            placeholder="Email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            style={fieldStyle}
          />
          <input
            type="tel"
            placeholder="Phone"
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
            style={fieldStyle}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => void handleAddPatient()}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: 'none',
                background: COLORS.primary,
                color: COLORS.text.inverse,
                fontWeight: 700,
                cursor: isSubmitting ? 'default' : 'pointer',
              }}
            >
              Save patient
            </button>
            <button
              type="button"
              onClick={() => setIsAddingPatient(false)}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: `1px solid ${COLORS.border}`,
                background: 'none',
                color: COLORS.text.secondary,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsAddingPatient(true)}
          style={{
            alignSelf: 'flex-start',
            padding: '8px 14px',
            borderRadius: 8,
            border: `1px solid ${COLORS.border}`,
            background: 'none',
            color: COLORS.primary,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          {MESSAGES.newCall.addPatientButton}
        </button>
      )}

      {error && <p style={{ color: COLORS.status.error, fontSize: '0.85rem', margin: 0 }}>{error}</p>}

      <button
        type="button"
        disabled={!selectedPatientId || isSubmitting}
        onClick={() => void handleStartCall()}
        style={{
          padding: '12px',
          borderRadius: 10,
          border: 'none',
          background: COLORS.primary,
          color: COLORS.text.inverse,
          fontWeight: 700,
          cursor: selectedPatientId && !isSubmitting ? 'pointer' : 'default',
          opacity: selectedPatientId && !isSubmitting ? 1 : 0.6,
        }}
      >
        {isSubmitting ? 'Starting…' : MESSAGES.newCall.startCallButton}
      </button>
    </div>
  )
}
