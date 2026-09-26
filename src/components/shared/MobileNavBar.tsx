import { CalendarDays, LayoutDashboard, LogOut, Users } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'
import type { ReactNode } from 'react'
import { Avatar } from '@/components/shared/Avatar'
import { Button } from '@/components/shared/Button'
import { Modal } from '@/components/shared/Modal'
import { COLORS, FONT_SIZES } from '@/constants/colors'
import { MESSAGES } from '@/constants/messages'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/hooks/useAuth'
import type { User } from '@/types/user.types'

const ROLE_LABEL: Record<User['role'], string> = {
  admin: MESSAGES.nav.roleAdmin,
  physio: MESSAGES.nav.rolePhysio,
  patient: MESSAGES.nav.rolePatient,
}

interface TabProps {
  icon: ReactNode
  label: string
  href: string
  active: boolean
}

const Tab = ({ icon, label, href, active }: TabProps): JSX.Element => (
  <Link href={href} className={`mobile-tab${active ? ' active' : ''}`} aria-current={active ? 'page' : undefined}>
    {icon}
    <span>{label}</span>
  </Link>
)

/**
 * Bottom tab bar for phones. Three destinations reached in one tap each —
 * a drawer behind a hamburger made every one of them a two-tap trip and hid
 * where you could go at all.
 */
export const MobileNavBar = (): JSX.Element => {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [isAccountOpen, setIsAccountOpen] = useState(false)

  const handleLogout = (): void => {
    setIsAccountOpen(false)
    logout()
    void router.push(ROUTES.login)
  }

  return (
    <>
      <nav className="mobile-nav" aria-label={MESSAGES.nav.dashboard}>
        <Tab
          icon={<LayoutDashboard size={20} />}
          label={MESSAGES.nav.dashboard}
          href={ROUTES.dashboardPhysio}
          active={router.pathname === ROUTES.dashboardPhysio}
        />
        <Tab
          icon={<CalendarDays size={20} />}
          label={MESSAGES.appointments.bookingsNavLabel}
          href={ROUTES.bookings}
          active={router.pathname === ROUTES.bookings}
        />
        <Tab
          icon={<Users size={20} />}
          label={MESSAGES.patients.navLabel}
          href={ROUTES.patients}
          active={router.pathname === ROUTES.patients}
        />

        {user && (
          <button
            type="button"
            onClick={() => setIsAccountOpen(true)}
            className="mobile-tab"
            aria-label={MESSAGES.nav.account}
          >
            <Avatar name={user.fullName} size={22} />
            <span>{MESSAGES.nav.account}</span>
          </button>
        )}
      </nav>

      {isAccountOpen && user && (
        <Modal
          title={MESSAGES.nav.account}
          maxWidth={400}
          onClose={() => setIsAccountOpen(false)}
          footer={
            <Button variant="danger" fullWidth onClick={handleLogout}>
              <LogOut size={15} />
              {MESSAGES.nav.logout}
            </Button>
          }
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar name={user.fullName} size={44} />
            <div style={{ minWidth: 0 }}>
              <p style={{ color: COLORS.text.primary, fontWeight: 700, fontSize: FONT_SIZES.base, margin: 0 }}>
                {user.fullName}
              </p>
              <p style={{ color: COLORS.text.secondary, fontSize: FONT_SIZES.sm, margin: '2px 0 0' }}>
                {ROLE_LABEL[user.role]}
              </p>
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}
