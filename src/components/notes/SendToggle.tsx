import { COLORS } from '@/constants/colors'

interface SendToggleProps {
  isEnabled: boolean
  onToggle: (value: boolean) => void
  onConfirm: () => void
  isSending: boolean
}

export const SendToggle = ({ isEnabled, onToggle, onConfirm, isSending }: SendToggleProps): JSX.Element => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        borderRadius: 12,
        background: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
      }}
    >
      <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
        <input type="checkbox" checked={isEnabled} onChange={(e) => onToggle(e.target.checked)} />
        <span style={{ color: COLORS.text.primary, fontSize: '0.9rem', fontWeight: 600 }}>
          Send report to patient
        </span>
      </label>
      <button
        type="button"
        disabled={isSending}
        onClick={onConfirm}
        style={{
          padding: '10px 20px',
          borderRadius: 10,
          border: 'none',
          background: COLORS.primary,
          color: COLORS.text.inverse,
          fontWeight: 700,
          cursor: isSending ? 'default' : 'pointer',
          opacity: isSending ? 0.6 : 1,
        }}
      >
        {isSending ? 'Sending…' : 'Finish'}
      </button>
    </div>
  )
}
