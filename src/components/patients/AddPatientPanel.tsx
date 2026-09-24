import { UserPlus } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/shared/Button'
import { Field } from '@/components/shared/Field'
import { Input } from '@/components/shared/Input'
import { Modal } from '@/components/shared/Modal'
import { COLORS, FONT_SIZES } from '@/constants/colors'
import { MESSAGES } from '@/constants/messages'
import { createPatientRequest } from '@/services/patient.service'
import type { User } from '@/types/user.types'

interface AddPatientPanelProps {
  token: string
  onPatientAdded?: (patient: User) => void
  /** Render as the primary action instead of the default secondary. */
  variant?: 'primary' | 'secondary'
}

export const AddPatientPanel = ({
  token,
  onPatientAdded,
  variant = 'secondary',
}: AddPatientPanelProps): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [issue, setIssue] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const close = (): void => {
    setIsOpen(false)
    setError(null)
  }

  const handleSave = async (): Promise<void> => {
    if (!name || !email || !phone) {
      setError(MESSAGES.newCall.missingContact)
      return
    }

    setIsSubmitting(true)
    setError(null)
    const res = await createPatientRequest(token, {
      fullName: name,
      email,
      phone,
      ...(issue.trim() ? { issue: issue.trim() } : {}),
    })
    setIsSubmitting(false)

    if (!res.success) {
      setError(res.message || MESSAGES.newCall.createPatientFailed)
      return
    }

    setName('')
    setEmail('')
    setPhone('')
    setIssue('')
    onPatientAdded?.(res.data)
    // Close straight away — the new patient appearing in the list behind the
    // dialog is the confirmation. Leaving it open showed a blank form that
    // re-triggered validation if Save was pressed again.
    close()
  }

  return (
    <>
      <Button
        variant={variant}
        onClick={() => {
          setIsOpen(true)
          setError(null)
        }}
      >
        <UserPlus size={16} />
        {MESSAGES.patients.addButton}
      </Button>

      {isOpen && (
        <Modal
          title={MESSAGES.newCall.addPatientTitle}
          subtitle={MESSAGES.patients.addSubtitle}
          maxWidth={460}
          onClose={close}
          footer={
            <div style={{ display: 'flex', gap: 10 }}>
              <Button variant="secondary" onClick={close} style={{ flex: 1 }}>
                {MESSAGES.common.cancel}
              </Button>
              <Button
                variant="primary"
                isLoading={isSubmitting}
                onClick={() => void handleSave()}
                style={{ flex: 2 }}
              >
                {isSubmitting ? MESSAGES.patients.saving : MESSAGES.patients.saveButton}
              </Button>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Field label={MESSAGES.patients.fieldName}>
              <Input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
            </Field>
            <Field label={MESSAGES.patients.fieldEmail}>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </Field>
            <Field label={MESSAGES.patients.fieldPhone}>
              <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            </Field>
            <Field label={MESSAGES.patients.fieldIssue}>
              <Input
                type="text"
                value={issue}
                onChange={(e) => setIssue(e.target.value)}
                placeholder={MESSAGES.patients.fieldIssuePlaceholder}
                maxLength={255}
              />
            </Field>

            {error && (
              <p role="alert" style={{ color: COLORS.status.error, fontSize: FONT_SIZES.base, margin: 0 }}>
                {error}
              </p>
            )}
          </div>
        </Modal>
      )}
    </>
  )
}
