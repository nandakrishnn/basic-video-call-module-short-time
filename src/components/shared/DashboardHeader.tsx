import { LogOut } from 'lucide-react'
import { useRouter } from 'next/router'
import { Button } from '@/components/shared/Button'
import { Logo } from '@/components/shared/Logo'
import { COLORS } from '@/constants/colors'
import { MESSAGES } from '@/constants/messages'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/hooks/useAuth'
import type { User } from '@/types/user.types'

const ROLE_LABEL: Record<User['role'], string> = {
  admin: MESSAGES.nav.roleAdmin,
  physio: MESSAGES.nav.rolePhysio,
  patient: MESSAGES.nav.rolePatient,
}

interface DashboardHeaderProps {
  title?: string
}

export const DashboardHeader = ({ title = 'Dashboard' }: DashboardHeaderProps): JSX.Element => {
  const router = useRouter()
  const { user, logout } = useAuth()

  const handleLogout = (): void => {
    logout()
    void router.push(ROUTES.login)
  }

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        background: COLORS.surface,
        borderBottom: `1px solid ${COLORS.border}`,
      }}
    >
      <div
        style={{
          maxWidth: 1080,
          margin: '0 auto',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Logo surface="light" size="sm" />
          <div style={{ width: 1, height: 24, background: COLORS.border }} />
          <span style={{ color: COLORS.text.secondary, fontSize: '0.85rem', fontWeight: 600 }}>{title}</span>
        </div>

        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ color: COLORS.text.primary, fontSize: '0.85rem', fontWeight: 700, margin: 0 }}>
                {user.fullName}
              </p>
              <p style={{ color: COLORS.text.muted, fontSize: '0.72rem', margin: 0 }}>{ROLE_LABEL[user.role]}</p>
            </div>
            <Button variant="secondary" size="sm" onClick={handleLogout}>
              <LogOut size={15} />
              {MESSAGES.nav.logout}
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}
