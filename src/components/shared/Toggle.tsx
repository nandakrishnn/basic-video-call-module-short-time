import { COLORS, RADII } from '@/constants/colors'

interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  disabled?: boolean
}

export const Toggle = ({ checked, onChange, label, disabled = false }: ToggleProps): JSX.Element => {
  return (
    <label
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        style={{
          position: 'relative',
          width: 44,
          height: 26,
          padding: 0,
          border: 'none',
          borderRadius: RADII.pill,
          background: checked ? COLORS.primaryLight : COLORS.border,
          cursor: disabled ? 'default' : 'pointer',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: 3,
            left: checked ? 21 : 3,
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: COLORS.text.inverse,
            boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
          }}
        />
      </button>
      {label && <span style={{ color: COLORS.text.primary, fontSize: '0.9rem' }}>{label}</span>}
    </label>
  )
}
