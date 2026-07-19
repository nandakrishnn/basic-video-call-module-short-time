import { X } from 'lucide-react'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { Button } from '@/components/shared/Button'
import { Card } from '@/components/shared/Card'
import { Input, Select } from '@/components/shared/Input'
import { COLORS, RADII } from '@/constants/colors'
import { MESSAGES } from '@/constants/messages'
import { ROUTES } from '@/constants/routes'
import { createAppointmentRequest } from '@/services/appointment.service'
import { createPatientRequest } from '@/services/patient.service'
import { createSessionRequest } from '@/services/session.service'
import type { User } from '@/types/user.types'

interface NewCallPanelProps {
  token: string
  patients: User[]
  onPatientAdded: (patient: User) => void
  onScheduled?: () => void
}

type ScheduleMode = 'now' | 'later'

const labelStyle = { fontSize: '0.78rem', fontWeight: 600, color: COLORS.text.primary }

export const NewCallPanel = ({ token, patients, onPatientAdded, onScheduled }: NewCallPanelProps): JSX.Element => {
  const router = useRouter()

  const [isOpen, setIsOpen] = useState(false)
  const [selectedPatientId, setSelectedPatientId] = useState('')

  const [isAddingPatient, setIsAddingPatient] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPhone, setNewPhone] = useState('')

  const [scheduleMode, setScheduleMode] = useState<ScheduleMode>('now')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [scheduled, setScheduled] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const resetAndClose = (): void => {
    setIsOpen(false)
    setSelectedPatientId('')
    setScheduleMode('now')
    setDate('')
    setTime('')
    setScheduled(false)
    setError(null)
  }

  const handleAddPatient = async (): Promise<void> => {
    if (!newName || !newEmail || !newPhone) {
      setError(MESSAGES.newCall.missingContact)
      return
    }

    setIsSubmitting(true)
    setError(null)
    const res = await createPatientRequest(token, { fullName: newName, email: newEmail, phone: newPhone })
    setIsSubmitting(false)

    if (!res.success) {
      setError(MESSAGES.newCall.createPatientFailed)
      return
    }

    onPatientAdded(res.data)
    setSelectedPatientId(res.data.id)
    setIsAddingPatient(false)
    setNewName('')
    setNewEmail('')
    setNewPhone('')
  }

  const handleStartNow = async (): Promise<void> => {
    setIsSubmitting(true)
    setError(null)
    const res = await createSessionRequest(token, selectedPatientId)
    setIsSubmitting(false)

    if (res.success) void router.push(ROUTES.session(res.data.id))
    else setError(res.message)
  }

  const handleScheduleLater = async (): Promise<void> => {
    if (!date || !time) {
      setError(MESSAGES.newCall.missingSchedule)
      return
    }

    setIsSubmitting(true)
    setError(null)
    const res = await createAppointmentRequest(token, {
      patientId: selectedPatientId,
      scheduledAt: new Date(`${date}T${time}`).toISOString(),
      sessionType: 'followup',
    })
    setIsSubmitting(false)

    if (res.success) {
      setScheduled(true)
      onScheduled?.()
    } else {
      setError(res.message)
    }
  }

  const handleSubmit = (): void => {
    if (!selectedPatientId) return
    void (scheduleMode === 'now' ? handleStartNow() : handleScheduleLater())
  }

  if (!isOpen) {
    return (
      <Button variant="primary" onClick={() => setIsOpen(true)} style={{ alignSelf: 'flex-start' }}>
        {MESSAGES.newCall.button}
      </Button>
    )
  }

  return (
    <Card style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ color: COLORS.text.primary, fontSize: '1rem', fontWeight: 700, margin: 0 }}>
          {MESSAGES.newCall.button}
        </h2>
        <button
          type="button"
          onClick={resetAndClose}
          aria-label="Close"
          style={{
            border: 'none',
            background: 'none',
            color: COLORS.text.muted,
            cursor: 'pointer',
            display: 'flex',
            padding: 4,
          }}
        >
          <X size={16} />
        </button>
      </div>

      {scheduled ? (
        <>
          <p style={{ color: COLORS.status.success, fontSize: '0.9rem', margin: 0 }}>
            {MESSAGES.newCall.scheduleSuccess}
          </p>
          <Button variant="secondary" onClick={resetAndClose}>
            {MESSAGES.newCall.doneButton}
          </Button>
        </>
      ) : (
        <>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={labelStyle}>{MESSAGES.newCall.selectPatient}</span>
            <Select value={selectedPatientId} onChange={(e) => setSelectedPatientId(e.target.value)}>
              <option value="">— Select —</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.fullName} ({patient.email ?? patient.phone})
                </option>
              ))}
            </Select>
          </label>

          {isAddingPatient ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                padding: 14,
                borderRadius: RADII.sm,
                background: COLORS.background,
              }}
            >
              <span style={labelStyle}>{MESSAGES.newCall.addPatientTitle}</span>
              <Input
                type="text"
                placeholder="Full name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
              />
              <Input
                type="email"
                placeholder="Email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
              />
              <Input
                type="tel"
                placeholder="Phone"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                required
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <Button variant="primary" size="sm" isLoading={isSubmitting} onClick={() => void handleAddPatient()}>
                  Save patient
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setIsAddingPatient(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsAddingPatient(true)}
              style={{ alignSelf: 'flex-start' }}
            >
              {MESSAGES.newCall.addPatientButton}
            </Button>
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            <Button
              variant={scheduleMode === 'now' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setScheduleMode('now')}
            >
              {MESSAGES.newCall.whenNow}
            </Button>
            <Button
              variant={scheduleMode === 'later' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setScheduleMode('later')}
            >
              {MESSAGES.newCall.whenLater}
            </Button>
          </div>

          {scheduleMode === 'later' && (
            <div style={{ display: 'flex', gap: 12 }}>
              <label style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={labelStyle}>Date</span>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </label>
              <label style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={labelStyle}>Time</span>
                <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
              </label>
            </div>
          )}

          {error && <p style={{ color: COLORS.status.error, fontSize: '0.85rem', margin: 0 }}>{error}</p>}

          <Button
            variant="primary"
            fullWidth
            disabled={!selectedPatientId}
            isLoading={isSubmitting}
            onClick={handleSubmit}
          >
            {scheduleMode === 'now'
              ? isSubmitting
                ? 'Starting…'
                : MESSAGES.newCall.startCallButton
              : isSubmitting
                ? 'Scheduling…'
                : MESSAGES.newCall.scheduleCallButton}
          </Button>
        </>
      )}
    </Card>
  )
}
