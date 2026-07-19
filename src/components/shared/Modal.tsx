import type { ReactNode } from 'react'
import { COLORS, RADII, SHADOWS } from '@/constants/colors'

interface ModalProps {
  children: ReactNode
  maxWidth?: number
  onOverlayClick?: () => void
}

export const Modal = ({ children, maxWidth = 480, onOverlayClick }: ModalProps): JSX.Element => {
  return (
    <div
      onClick={onOverlayClick}
      style={{
        position: 'fixed',
        inset: 0,
        background: COLORS.glass.dark,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        zIndex: 100,
      }}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        style={{
          width: '100%',
          maxWidth,
          maxHeight: '90vh',
          overflowY: 'auto',
          background: COLORS.surface,
          borderRadius: RADII.lg,
          boxShadow: SHADOWS.lg,
          padding: 28,
        }}
      >
        {children}
      </div>
    </div>
  )
}
