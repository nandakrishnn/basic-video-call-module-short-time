import type { AppointmentStatus, AppointmentType } from '../constants/enums'

export interface Appointment {
  id: string
  patientId: string
  physioId: string
  scheduledAt: string
  durationMinutes: number
  sessionType: AppointmentType
  status: AppointmentStatus
  sessionId: string | null
  internalNote: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateAppointmentInput {
  patientId: string
  physioId: string
  scheduledAt: string
  durationMinutes?: number
  sessionType: AppointmentType
  internalNote?: string
}

export interface UpdateAppointmentInput {
  scheduledAt?: string
  durationMinutes?: number
  sessionType?: AppointmentType
  status?: AppointmentStatus
  internalNote?: string
}
