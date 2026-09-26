import { CalendarDays, LayoutDashboard, LogOut, Menu, Users, X } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'
import type { ReactNode } from 'react'
import { Avatar } from '@/components/shared/Avatar'
import { MobileNavBar } from '@/components/shared/MobileNavBar'
import { Button } from '@/components/shared/Button'
import { Logo } from '@/components/shared/Logo'
import { Modal } from '@/components/shared/Modal'
import { COLORS, FONT_SIZES, RADII } from '@/constants/colors'
import { MESSAGES } from '@/constants/messages'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/hooks/useAuth'
import type { User } from '@/types/user.types'

/** Kept in sync with --rail-width in globals.css. */
export const SIDEBAR_WIDTH = 252

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
  onClick?: () => void
}

// Hover and active styling lives in globals.css (.rail-item) so the inline
// style object stays static and pseudo-states are reachable.
const NavItem = ({ icon, label, href, active = false, onClick }: NavItemProps): JSX.Element => (
  <Link
    href={href}
    onClick={onClick}
    className={`rail-item${active ? ' active' : ''}`}
    aria-current={active ? 'page' : undefined}
  >
    {icon}
    {label}
  </Link>
)

export const DashboardSidebar = (): JSX.Element => {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [isConfirmingLogout, setIsConfirmingLogout] = useState(false)

  const handleLogout = (): void => {
    setIsConfirmingLogout(false)
    logout()
    void router.push(ROUTES.login)
  }

  const closeDrawer = (): void => setIsOpen(false)

  return (
    <>
      <div className="dashboard-mobile-topbar">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open navigation"
          className="dashboard-menu-button"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
            height: 40,
            border: 'none',
            borderRadius: RADII.sm,
            background: 'transparent',
            color: COLORS.text.primary,
            cursor: 'pointer',
          }}
        >
          <Menu size={22} />
        </button>
        <Logo surface="light" size="sm" showWordmark />
      </div>

      <aside
        className={`dashboard-sidebar${isOpen ? ' open' : ''}`}
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
          alignItems: 'stretch',
          padding: '24px 16px',
          gap: 28,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
          <Logo surface="light" size="md" showWordmark />
          {isOpen && (
            <button
              type="button"
              onClick={closeDrawer}
              aria-label="Close navigation"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 28,
                height: 28,
                border: 'none',
                borderRadius: RADII.pill,
                background: COLORS.surfaceAlt,
                color: COLORS.text.secondary,
                cursor: 'pointer',
                padding: 0,
              }}
            >
              <X size={15} />
            </button>
          )}
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
          <NavItem
            icon={<LayoutDashboard size={20} />}
            label={MESSAGES.nav.dashboard}
            href={ROUTES.dashboardPhysio}
            active={router.pathname === ROUTES.dashboardPhysio}
            onClick={closeDrawer}
          />
          <NavItem
            icon={<CalendarDays size={20} />}
            label={MESSAGES.appointments.bookingsNavLabel}
            href={ROUTES.bookings}
            active={router.pathname === ROUTES.bookings}
            onClick={closeDrawer}
          />
          <NavItem
            icon={<Users size={20} />}
            label={MESSAGES.patients.navLabel}
            href={ROUTES.patients}
            active={router.pathname === ROUTES.patients}
            onClick={closeDrawer}
          />
        </nav>

        {user && (
          <div
            style={{
              borderTop: `1px solid ${COLORS.border}`,
              paddingTop: 16,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: 10,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 11, width: '100%', padding: '0 4px' }}>
              <Avatar name={user.fullName} size={38} />
              <div style={{ minWidth: 0 }}>
                <p
                  title={user.fullName}
                  style={{
                    color: COLORS.text.primary,
                    fontSize: FONT_SIZES.base,
                    fontWeight: 700,
                    margin: 0,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {user.fullName}
                </p>
                <p
                  style={{
                    color: COLORS.text.muted,
                    fontSize: FONT_SIZES.sm,
                    margin: '1px 0 0',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {ROLE_LABEL[user.role]}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsConfirmingLogout(true)}
              title={MESSAGES.nav.logout}
              aria-label={MESSAGES.nav.logout}
              className="rail-item"
              style={{ width: '100%', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              <LogOut size={17} />
              {MESSAGES.nav.logout}
            </button>
          </div>
        )}
      </aside>

      {isOpen && <div className="dashboard-sidebar-backdrop open" onClick={closeDrawer} />}

      <MobileNavBar />

      {isConfirmingLogout && (
        <Modal
          title={MESSAGES.nav.logoutConfirmTitle}
          subtitle={MESSAGES.nav.logoutConfirmBody}
          maxWidth={400}
          onClose={() => setIsConfirmingLogout(false)}
          footer={
            <div style={{ display: 'flex', gap: 10 }}>
              <Button variant="secondary" onClick={() => setIsConfirmingLogout(false)} style={{ flex: 1 }}>
                {MESSAGES.common.cancel}
              </Button>
              <Button variant="danger" onClick={handleLogout} style={{ flex: 1 }}>
                <LogOut size={15} />
                {MESSAGES.nav.logout}
              </Button>
            </div>
          }
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar name={user?.fullName ?? '?'} size={40} />
            <div style={{ minWidth: 0 }}>
              <p style={{ color: COLORS.text.primary, fontWeight: 700, fontSize: FONT_SIZES.base, margin: 0 }}>
                {user?.fullName}
              </p>
              <p style={{ color: COLORS.text.secondary, fontSize: FONT_SIZES.sm, margin: '2px 0 0' }}>
                {user ? ROLE_LABEL[user.role] : ''}
              </p>
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}
