import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { COLORS, SHADOWS } from '@/constants/colors'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode
  active?: boolean
  activeColor?: string
  size?: number
}

export const IconButton = ({
  icon,
  active = false,
  activeColor = COLORS.status.error,
  size = 48,
  style,
  ...rest
}: IconButtonProps): JSX.Element => {
  return (
    <button
      type="button"
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: active ? activeColor : COLORS.onDark.fill,
        color: COLORS.video.controlsText,
        cursor: 'pointer',
        boxShadow: SHADOWS.md,
        ...style,
      }}
      {...rest}
    >
      {icon}
    </button>
  )
}
