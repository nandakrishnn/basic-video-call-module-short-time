import { Check, Plus } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/shared/Button'
import { Field } from '@/components/shared/Field'
import { Input, Select } from '@/components/shared/Input'
import { Modal } from '@/components/shared/Modal'
import { COLORS, FONT_SIZES, RADII } from '@/constants/colors'
import { MESSAGES } from '@/constants/messages'
import { createAppointmentRequest } from '@/services/appointment.service'
import { createPatientRequest } from '@/services/patient.service'
import type { User } from '@/types/user.types'

interface NewCallPanelProps {
  token: string
  patients: User[]
  onPatientAdded: (patient: User) => void
  onScheduled?: () => void
  /** Trigger label — the dashboard calls this "New Appointment". */
  label?: string
}

export const NewCallPanel = ({
  token,
  patients,
  onPatientAdded,
  onScheduled,
  label,
}: NewCallPanelProps): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedPatientId, setSelectedPatientId] = useState('')

  const [isAddingPatient, setIsAddingPatient] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newIssue, setNewIssue] = useState('')

  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [scheduled, setScheduled] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const resetAndClose = (): void => {
    setIsOpen(false)
    setSelectedPatientId('')
    setDate('')
    setTime('')
    setScheduled(false)
    setIsAddingPatient(false)
    setError(null)
  }

  const handleAddPatient = async (): Promise<void> => {
    if (!newName || !newEmail || !newPhone) {
      setError(MESSAGES.newCall.missingContact)
      return
    }

    setIsSubmitting(true)
    setError(null)
    const res = await createPatientRequest(token, {
      fullName: newName,
      email: newEmail,
      phone: newPhone,
      ...(newIssue.trim() ? { issue: newIssue.trim() } : {}),
    })
    setIsSubmitting(false)

    if (!res.success) {
      setError(res.message || MESSAGES.newCall.createPatientFailed)
      return
    }

    onPatientAdded(res.data)
    setSelectedPatientId(res.data.id)
    setIsAddingPatient(false)
    setNewName('')
    setNewEmail('')
    setNewPhone('')
    setNewIssue('')
  }

  const handleSubmit = async (): Promise<void> => {
    if (!selectedPatientId) return

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

  return (
    <>
      <Button variant="primary" onClick={() => setIsOpen(true)}>
        <Plus size={16} />
        {label ?? MESSAGES.newCall.button}
      </Button>

      {isOpen && (
        <Modal
          title={MESSAGES.newCall.button}
          subtitle={scheduled ? undefined : MESSAGES.newCall.subtitle}
          maxWidth={500}
          onClose={resetAndClose}
          footer={
            scheduled ? (
              <Button variant="primary" fullWidth onClick={resetAndClose}>
                {MESSAGES.newCall.doneButton}
              </Button>
            ) : (
              <div style={{ display: 'flex', gap: 10 }}>
                <Button variant="secondary" onClick={resetAndClose} style={{ flex: 1 }}>
                  {MESSAGES.common.cancel}
                </Button>
                <Button
                  variant="primary"
                  disabled={!selectedPatientId}
                  isLoading={isSubmitting}
                  onClick={() => void handleSubmit()}
                  style={{ flex: 2 }}
                >
                  {isSubmitting ? MESSAGES.newCall.scheduling : MESSAGES.newCall.scheduleCallButton}
                </Button>
              </div>
            )
          }
        >
          {scheduled ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 9,
                padding: '13px 15px',
                borderRadius: RADII.sm,
                background: COLORS.statusSoft.success,
                color: COLORS.status.success,
                fontSize: FONT_SIZES.base,
                fontWeight: 600,
              }}
            >
              <Check size={17} />
              {MESSAGES.newCall.scheduleSuccess}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <Field label={MESSAGES.newCall.selectPatient}>
                <Select value={selectedPatientId} onChange={(e) => setSelectedPatientId(e.target.value)}>
                  <option value="">{MESSAGES.newCall.selectPlaceholder}</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.fullName} ({patient.email ?? patient.phone})
                    </option>
                  ))}
                </Select>
              </Field>

              {isAddingPatient ? (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 11,
                    padding: 16,
                    borderRadius: RADII.md,
                    background: COLORS.primarySofter,
                    border: `1px solid ${COLORS.border}`,
                  }}
                >
                  <span className="field-label">{MESSAGES.newCall.addPatientTitle}</span>
                  <Input
                    type="text"
                    placeholder={MESSAGES.patients.fieldName}
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                  />
                  <Input
                    type="email"
                    placeholder={MESSAGES.patients.fieldEmail}
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    required
                  />
                  <Input
                    type="tel"
                    placeholder={MESSAGES.patients.fieldPhone}
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    required
                  />
                  <Input
                    type="text"
                    placeholder={MESSAGES.patients.fieldIssuePlaceholder}
                    value={newIssue}
                    onChange={(e) => setNewIssue(e.target.value)}
                    maxLength={255}
                  />
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <Button variant="primary" size="sm" isLoading={isSubmitting} onClick={() => void handleAddPatient()}>
                      {MESSAGES.patients.saveButton}
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => setIsAddingPatient(false)}>
                      {MESSAGES.common.cancel}
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

              <div className="form-row-2up">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Field label={MESSAGES.newCall.fieldDate}>
                    <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                  </Field>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Field label={MESSAGES.newCall.fieldTime}>
                    <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
                  </Field>
                </div>
              </div>

              {error && (
                <p role="alert" style={{ color: COLORS.status.error, fontSize: FONT_SIZES.base, margin: 0 }}>
                  {error}
                </p>
              )}
            </div>
          )}
        </Modal>
      )}
    </>
  )
}
