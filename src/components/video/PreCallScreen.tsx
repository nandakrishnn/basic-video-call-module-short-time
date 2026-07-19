import { useEffect, useState } from 'react'
import { Button } from '@/components/shared/Button'
import { Card } from '@/components/shared/Card'
import { Logo } from '@/components/shared/Logo'
import { COLORS } from '@/constants/colors'
import { MESSAGES } from '@/constants/messages'

interface PreCallScreenProps {
  patientName: string
  sessionType: string
  onJoin: () => void
}

type DeviceStatus = 'checking' | 'ready' | 'error'

const STATUS_COLOR: Record<DeviceStatus, string> = {
  checking: COLORS.status.warning,
  ready: COLORS.status.success,
  error: COLORS.status.error,
}

const STATUS_TEXT: Record<DeviceStatus, string> = {
  checking: MESSAGES.session.deviceChecking,
  ready: MESSAGES.session.deviceReady,
  error: MESSAGES.session.deviceError,
}

export const PreCallScreen = ({ patientName, sessionType, onJoin }: PreCallScreenProps): JSX.Element => {
  const [deviceStatus, setDeviceStatus] = useState<DeviceStatus>('checking')

  useEffect(() => {
    let cancelled = false

    navigator.mediaDevices
      ?.getUserMedia({ audio: true, video: true })
      .then((stream) => {
        stream.getTracks().forEach((track) => track.stop())
        if (!cancelled) setDeviceStatus('ready')
      })
      .catch(() => {
        if (!cancelled) setDeviceStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: COLORS.background,
        borderRadius: 16,
      }}
    >
      <Card elevation="md" style={{ width: '100%', maxWidth: 380, display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center', textAlign: 'center' }}>
        <Logo surface="light" size="lg" />

        <div>
          <h1 style={{ color: COLORS.text.primary, fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>
            {MESSAGES.session.readyTitle}
          </h1>
          <p style={{ color: COLORS.text.secondary, fontSize: '0.9rem', margin: '6px 0 0' }}>
            {patientName} · {sessionType}
          </p>
        </div>

        <Button variant="primary" fullWidth onClick={onJoin}>
          {MESSAGES.session.joinButton}
        </Button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: STATUS_COLOR[deviceStatus],
            }}
          />
          <span style={{ color: COLORS.text.muted, fontSize: '0.8rem' }}>{STATUS_TEXT[deviceStatus]}</span>
        </div>
      </Card>
    </div>
  )
}
