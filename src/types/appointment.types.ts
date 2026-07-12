export type AppointmentType = 'initial' | 'followup' | 'review' | 'discharge'
export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled'

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
}
