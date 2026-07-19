import type { Appointment } from './appointment.types'

export interface RecentPatient {
  id: string
  fullName: string
  email: string | null
  phone: string | null
}

export interface PhysioDashboardData {
  todayAppointments: Appointment[]
  upcomingThisWeek: Appointment[]
  recentPatients: RecentPatient[]
  stats: {
    sessionsToday: number
    sessionsThisWeek: number
    sessionsThisMonth: number
  }
  sessionsTrend: { date: string; count: number }[]
}

export interface PastCall {
  sessionId: string
  physioName: string
  startedAt: string | null
  endedAt: string | null
  report: { id: string; pdfUrl: string; sentAt: string } | null
}

export interface PatientDashboardData {
  nextAppointment: Appointment | null
  pastCalls: PastCall[]
  stats: {
    totalCalls: number
    totalMinutes: number
  }
}

export interface AdminDashboardData {
  todayAppointments: Appointment[]
  physios: { id: string; fullName: string }[]
  patients: { id: string; fullName: string }[]
  stats: {
    totalAppointmentsToday: number
    totalPhysios: number
    totalPatients: number
  }
}
