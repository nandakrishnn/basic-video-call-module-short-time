import { CalendarDays, LayoutDashboard, Users } from 'lucide-react'
import type { ReactNode } from 'react'
import { MESSAGES } from '@/constants/messages'
import { ROUTES } from '@/constants/routes'
import type { User } from '@/types/user.types'

export interface NavDestination {
  icon: ReactNode
  label: string
  href: string
}

/**
 * Where a role is allowed to go.
 *
 * The rail and the mobile tab bar both read from here, so they cannot drift
 * into offering different destinations — and a patient is never shown Bookings
 * or Patients, which are physio-only and would reject them on arrival.
 */
export const navDestinationsFor = (role: User['role'] | undefined): NavDestination[] => {
  if (role === 'patient') {
    return [
      { icon: <LayoutDashboard size={20} />, label: MESSAGES.nav.mySessions, href: ROUTES.dashboardPatient },
    ]
  }

  return [
    { icon: <LayoutDashboard size={20} />, label: MESSAGES.nav.dashboard, href: ROUTES.dashboardPhysio },
    { icon: <CalendarDays size={20} />, label: MESSAGES.appointments.bookingsNavLabel, href: ROUTES.bookings },
    { icon: <Users size={20} />, label: MESSAGES.patients.navLabel, href: ROUTES.patients },
  ]
}

/**
 * Where logging out sends someone. A patient signs in with a one-time code, so
 * dropping them on the physio's email-and-password form leaves them stuck.
 */
export const loginRouteFor = (role: User['role'] | undefined): string =>
  role === 'patient' ? ROUTES.patientLogin : ROUTES.login
