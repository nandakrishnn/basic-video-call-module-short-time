import { X } from 'lucide-react'
import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { COLORS, FONT_SIZES, RADII, SHADOWS } from '@/constants/colors'

interface ModalProps {
  children: ReactNode
  title?: string
  subtitle?: string
  maxWidth?: number
  onClose?: () => void
  /** Rendered pinned below the scrollable body — actions live here. */
  footer?: ReactNode
}

export const Modal = ({ children, title, subtitle, maxWidth = 480, onClose, footer }: ModalProps): JSX.Element => {
  // Escape closes, and the page behind must not scroll while the dialog is up.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') onClose?.()
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [onClose])

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      style={{
        position: 'fixed',
        inset: 0,
        background: COLORS.video.overlay,
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        zIndex: 300,
      }}
    >
      <div
        className="modal-panel"
        onClick={(event) => event.stopPropagation()}
        style={{
          width: '100%',
          maxWidth,
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          background: COLORS.surface,
          borderRadius: RADII.xl,
          boxShadow: SHADOWS.lg,
          overflow: 'hidden',
        }}
      >
        {(title || onClose) && (
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 16,
              padding: '24px 26px 18px',
              borderBottom: `1px solid ${COLORS.border}`,
              flexShrink: 0,
            }}
          >
            <div style={{ minWidth: 0 }}>
              {title && (
                <h2 style={{ color: COLORS.text.primary, fontSize: FONT_SIZES.lg, fontWeight: 700, margin: 0 }}>
                  {title}
                </h2>
              )}
              {subtitle && (
                <p style={{ color: COLORS.text.secondary, fontSize: FONT_SIZES.sm, margin: '5px 0 0' }}>{subtitle}</p>
              )}
            </div>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 32,
                  height: 32,
                  flexShrink: 0,
                  border: 'none',
                  borderRadius: RADII.pill,
                  background: COLORS.surfaceAlt,
                  color: COLORS.text.secondary,
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>
        )}

        <div style={{ padding: '22px 26px', overflowY: 'auto', flex: 1, minHeight: 0 }}>{children}</div>

        {footer && (
          <div
            style={{
              padding: '18px 26px 24px',
              borderTop: `1px solid ${COLORS.border}`,
              background: COLORS.primarySofter,
              flexShrink: 0,
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
