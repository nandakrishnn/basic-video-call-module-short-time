import { LayoutDashboard, LogOut, Mail } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import type { ReactNode } from 'react'
import { Avatar } from '@/components/shared/Avatar'
import { Button } from '@/components/shared/Button'
import { Logo } from '@/components/shared/Logo'
import { COLORS, RADII } from '@/constants/colors'
import { MESSAGES } from '@/constants/messages'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/hooks/useAuth'
import type { User } from '@/types/user.types'

export const SIDEBAR_WIDTH = 240

const ROLE_LABEL: Record<User['role'], string> = {
  admin: MESSAGES.nav.roleAdmin,
  physio: MESSAGES.nav.rolePhysio,
  patient: MESSAGES.nav.rolePatient,
}

interface NavItemProps {
  icon: ReactNode
  label: string
  href: string
  active?: boolean
}

const NavItem = ({ icon, label, href, active = false }: NavItemProps): JSX.Element => (
  <Link
    href={href}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '10px 12px',
      borderRadius: RADII.sm,
      textDecoration: 'none',
      background: active ? COLORS.primary : 'transparent',
      color: active ? COLORS.text.inverse : COLORS.text.secondary,
      fontSize: '0.88rem',
      fontWeight: 600,
    }}
  >
    {icon}
    {label}
  </Link>
)

export const DashboardSidebar = (): JSX.Element => {
  const router = useRouter()
  const { user, logout } = useAuth()

  const handleLogout = (): void => {
    logout()
    void router.push(ROUTES.login)
  }

  return (
    <aside
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        width: SIDEBAR_WIDTH,
        background: COLORS.surface,
        borderRight: `1px solid ${COLORS.border}`,
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 16px',
        zIndex: 10,
      }}
    >
      <div style={{ padding: '0 8px', marginBottom: 36 }}>
        <Logo surface="light" size="md" />
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
        <NavItem
          icon={<LayoutDashboard size={18} />}
          label="Dashboard"
          href={ROUTES.dashboardPhysio}
          active={router.pathname === ROUTES.dashboardPhysio}
        />
        <NavItem
          icon={<Mail size={18} />}
          label="Contact"
          href={ROUTES.contact}
          active={router.pathname === ROUTES.contact}
        />
      </nav>

      {user && (
        <div
          style={{
            borderTop: `1px solid ${COLORS.border}`,
            paddingTop: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Avatar name={user.fullName} />
            <div style={{ minWidth: 0 }}>
              <p
                style={{
                  color: COLORS.text.primary,
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  margin: 0,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {user.fullName}
              </p>
              <p style={{ color: COLORS.text.muted, fontSize: '0.72rem', margin: 0 }}>{ROLE_LABEL[user.role]}</p>
            </div>
          </div>
          <Button variant="secondary" size="sm" fullWidth onClick={handleLogout}>
            <LogOut size={15} />
            {MESSAGES.nav.logout}
          </Button>
        </div>
      )}
    </aside>
  )
}
