import { API } from '@/constants/api'
import { apiRequest } from '@/lib/apiClient'
import type { Appointment, AppointmentType } from '@/types/appointment.types'

interface CreateAppointmentBody {
  patientId: string
  scheduledAt: string
  durationMinutes?: number
  sessionType: AppointmentType
  internalNote?: string
}

export const createAppointmentRequest = (token: string, body: CreateAppointmentBody) =>
  apiRequest<Appointment>(API.appointments.create, { method: 'POST', token, body })

export const getAppointmentsByPhysioRequest = (token: string, physioId: string) =>
  apiRequest<Appointment[]>(API.appointments.byPhysio(physioId), { token })

export const getAppointmentsByPatientRequest = (token: string, patientId: string) =>
  apiRequest<Appointment[]>(API.appointments.byPatient(patientId), { token })

export const updateAppointmentRequest = (
  token: string,
  id: string,
  body: Partial<CreateAppointmentBody>,
) => apiRequest<Appointment>(API.appointments.update(id), { method: 'PATCH', token, body })

export const cancelAppointmentRequest = (token: string, id: string) =>
  apiRequest<Appointment>(API.appointments.cancel(id), { method: 'DELETE', token })
