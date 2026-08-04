import { Check, X } from 'lucide-react'
import { COLORS, RADII, SHADOWS } from '@/constants/colors'
import type { KnockingParticipant } from '@/hooks/useJitsiCall'

interface LobbyRequestsProps {
  participants: KnockingParticipant[]
  offsetTop?: number
  onAdmit: (id: string) => void
  onReject: (id: string) => void
}

export const LobbyRequests = ({
  participants,
  offsetTop = 16,
  onAdmit,
  onReject,
}: LobbyRequestsProps): JSX.Element | null => {
  if (participants.length === 0) return null

  return (
    <div
      style={{
        position: 'absolute',
        top: offsetTop,
        right: 16,
        zIndex: 4,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        width: 260,
        maxWidth: 'calc(100vw - 32px)',
      }}
    >
      {participants.map((participant) => (
        <div
          key={participant.id}
          style={{
            background: COLORS.surface,
            borderRadius: RADII.md,
            boxShadow: SHADOWS.lg,
            padding: 14,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <p style={{ margin: 0, fontSize: '0.85rem', color: COLORS.text.primary }}>
            <strong>{participant.name}</strong> wants to join the call
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={() => onAdmit(participant.id)}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '8px 0',
                borderRadius: RADII.sm,
                border: 'none',
                background: COLORS.status.success,
                color: COLORS.text.inverse,
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Check size={14} />
              Admit
            </button>
            <button
              type="button"
              onClick={() => onReject(participant.id)}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '8px 0',
                borderRadius: RADII.sm,
                border: `1px solid ${COLORS.border}`,
                background: COLORS.background,
                color: COLORS.text.primary,
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <X size={14} />
              Deny
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
