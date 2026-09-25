import { LifeBuoy, MessageCircle, Phone, X } from 'lucide-react'
import { useState } from 'react'
import { COLORS, FONT_SIZES, RADII, SHADOWS } from '@/constants/colors'
import { CONFIG } from '@/constants/config'
import { MESSAGES } from '@/constants/messages'

interface TroubleshootButtonProps {
  counterpartName: string
  isChatOpen: boolean
  onToggleChat: () => void
}

export const TroubleshootButton = ({
  counterpartName,
  isChatOpen,
  onToggleChat,
}: TroubleshootButtonProps): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false)

  // While Jitsi's own chat panel is open, it owns the layout (full-screen on
  // mobile, docked on desktop) — swap to a plain "close chat" affordance
  // instead of our popover, which would otherwise render on top of it.
  if (isChatOpen) {
    return (
      <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 3 }}>
        <button
          type="button"
          onClick={onToggleChat}
          aria-label={MESSAGES.support.closeChat}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 9,
            padding: '13px 22px',
            borderRadius: RADII.pill,
            border: 'none',
            background: COLORS.primaryLight,
            color: COLORS.text.inverse,
            fontSize: FONT_SIZES.md,
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: SHADOWS.md,
          }}
        >
          <X size={19} />
          {MESSAGES.support.closeChat}
        </button>
      </div>
    )
  }

  return (
    // Anchored top-left rather than top-right — Jitsi's own participant
    // thumbnail is typically rendered top-right, and the two were overlapping
    // on narrower viewports where Jitsi's layout shifts.
    <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 3 }}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={MESSAGES.support.trigger}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 9,
          padding: '13px 22px',
          borderRadius: RADII.pill,
          border: 'none',
          background: COLORS.primaryLight,
          color: COLORS.text.inverse,
          fontSize: FONT_SIZES.md,
          fontWeight: 700,
          cursor: 'pointer',
          boxShadow: SHADOWS.md,
        }}
      >
        <LifeBuoy size={19} />
        {MESSAGES.support.trigger}
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 10px)',
            left: 0,
            width: 240,
            maxWidth: 'calc(100vw - 48px)',
            maxHeight: 'calc(100vh - 180px)',
            overflowY: 'auto',
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
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: COLORS.text.primary }}>{MESSAGES.support.title}</span>
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
              onToggleChat()
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
            {MESSAGES.support.chatWith(counterpartName)}
          </button>

          <a
            href={`tel:${CONFIG.support.phoneNumber.replace(/\s/g, '')}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              borderRadius: RADII.sm,
              border: `1px solid ${COLORS.border}`,
              background: COLORS.surfaceAlt,
              color: COLORS.text.primary,
              fontSize: FONT_SIZES.sm,
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            <Phone size={16} color={COLORS.status.success} style={{ flexShrink: 0 }} />
            {/* Label above number: inline, the number wrapped mid-digits. */}
            <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <span>{MESSAGES.support.callSupport}</span>
              <span style={{ color: COLORS.text.secondary, fontWeight: 500, whiteSpace: 'nowrap' }}>
                {CONFIG.support.phoneNumber}
              </span>
            </span>
          </a>
        </div>
      )}
    </div>
  )
}
