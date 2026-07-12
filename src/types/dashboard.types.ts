import type { Appointment } from './appointment.types'

export interface PhysioDashboardData {
  todayAppointments: Appointment[]
  upcomingThisWeek: Appointment[]
  recentPatientIds: string[]
  stats: {
    sessionsToday: number
    sessionsThisWeek: number
    sessionsThisMonth: number
  }
}

export interface PatientDashboardData {
  nextAppointment: Appointment | null
  pastSessions: Appointment[]
  reports: { id: string; pdfUrl: string; sentAt: string }[]
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
