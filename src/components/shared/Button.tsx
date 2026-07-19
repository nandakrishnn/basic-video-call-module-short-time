import type { ButtonHTMLAttributes, CSSProperties } from 'react'
import { COLORS, RADII } from '@/constants/colors'

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'
type ButtonSize = 'sm' | 'md'

type ButtonShape = 'rounded' | 'pill'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  shape?: ButtonShape
  isLoading?: boolean
  fullWidth?: boolean
}

const VARIANT_STYLE: Record<ButtonVariant, CSSProperties> = {
  primary: { background: COLORS.primary, color: COLORS.text.inverse, border: 'none' },
  secondary: {
    background: COLORS.background,
    color: COLORS.text.primary,
    border: `1px solid ${COLORS.border}`,
  },
  danger: { background: COLORS.status.error, color: COLORS.text.inverse, border: 'none' },
  ghost: { background: 'transparent', color: COLORS.text.secondary, border: 'none' },
}

const SIZE_STYLE: Record<ButtonSize, CSSProperties> = {
  sm: { padding: '8px 16px', fontSize: '0.85rem' },
  md: { padding: '12px 20px', fontSize: '0.95rem' },
}

const spinnerStyle: CSSProperties = {
  display: 'inline-block',
  width: 14,
  height: 14,
  borderRadius: '50%',
  border: '2px solid rgba(255,255,255,0.4)',
  borderTopColor: '#FFFFFF',
  animation: 'spin 700ms linear infinite',
}

export const Button = ({
  variant = 'primary',
  size = 'md',
  shape = 'rounded',
  isLoading = false,
  fullWidth = false,
  disabled,
  children,
  style,
  ...rest
}: ButtonProps): JSX.Element => {
  const isDisabled = disabled || isLoading

  return (
    <button
      type="button"
      disabled={isDisabled}
      style={{
        ...VARIANT_STYLE[variant],
        ...SIZE_STYLE[size],
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        width: fullWidth ? '100%' : undefined,
        borderRadius: shape === 'pill' ? RADII.pill : RADII.md,
        fontWeight: 700,
        cursor: isDisabled ? 'default' : 'pointer',
        opacity: isDisabled ? 0.6 : 1,
        ...style,
      }}
      {...rest}
    >
      {isLoading && <span style={spinnerStyle} aria-hidden="true" />}
      {children}
    </button>
  )
}
