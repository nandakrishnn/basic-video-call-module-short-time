import { LifeBuoy, MessageCircle, Phone, X } from 'lucide-react'
import { useState } from 'react'
import { COLORS, RADII, SHADOWS } from '@/constants/colors'
import { CONFIG } from '@/constants/config'

interface TroubleshootButtonProps {
  counterpartName: string
  onOpenChat: () => void
}

export const TroubleshootButton = ({ counterpartName, onOpenChat }: TroubleshootButtonProps): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    // Anchored top-left rather than top-right — Jitsi's own participant
    // thumbnail is typically rendered top-right, and the two were overlapping
    // on narrower viewports where Jitsi's layout shifts.
    <div style={{ position: 'absolute', top: 78, left: 16, zIndex: 3 }}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Facing troubles?"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '8px 14px',
          borderRadius: RADII.pill,
          border: 'none',
          background: 'rgba(255,255,255,0.16)',
          color: COLORS.text.inverse,
          fontSize: '0.78rem',
          fontWeight: 600,
          cursor: 'pointer',
          boxShadow: SHADOWS.sm,
        }}
      >
        <LifeBuoy size={16} />
        Facing troubles?
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 10px)',
            left: 0,
            width: 240,
            background: COLORS.surface,
            borderRadius: RADII.md,
            boxShadow: SHADOWS.lg,
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: COLORS.text.primary }}>Need help?</span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close"
              style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: COLORS.text.muted }}
            >
              <X size={16} />
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              onOpenChat()
              setIsOpen(false)
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 12px',
              borderRadius: RADII.sm,
              border: `1px solid ${COLORS.border}`,
              background: COLORS.background,
              color: COLORS.text.primary,
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <MessageCircle size={16} color={COLORS.primaryLight} />
            Chat with {counterpartName}
          </button>

          <a
            href={`tel:${CONFIG.support.phoneNumber}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 12px',
              borderRadius: RADII.sm,
              border: `1px solid ${COLORS.border}`,
              background: COLORS.background,
              color: COLORS.text.primary,
              fontSize: '0.82rem',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            <Phone size={16} color={COLORS.status.success} />
            Call support: {CONFIG.support.phoneNumber}
          </a>
        </div>
      )}
    </div>
  )
}
