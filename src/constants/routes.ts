// Every frontend route path used in the app. Never hardcode a route string elsewhere.

export const ROUTES = {
  home: '/',

  login: '/login',
  patientLogin: '/patient-login',
  contact: '/contact',
  patientJoin: (token: string) => `/session/join/${token}`,

  session: (sessionId: string) => `/session/${sessionId}`,
  sessionNotes: (sessionId: string) => `/session/notes/${sessionId}`,

  appointments: '/appointments',
  appointmentDetail: (appointmentId: string) => `/appointments/${appointmentId}`,
  appointmentSchedule: '/appointments/schedule',

  dashboardPhysio: '/dashboard/physio',
  dashboardPatient: '/dashboard/patient',
  dashboardAdmin: '/dashboard/admin',
} as const
