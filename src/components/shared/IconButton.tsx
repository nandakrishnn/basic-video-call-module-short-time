import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { COLORS } from '@/constants/colors'

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
        background: active ? activeColor : 'rgba(255,255,255,0.16)',
        color: COLORS.video.controlsText,
        cursor: 'pointer',
        boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
        ...style,
      }}
      {...rest}
    >
      {icon}
    </button>
  )
}
