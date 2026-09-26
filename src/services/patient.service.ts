import { API } from '@/constants/api'
import { apiRequest } from '@/lib/apiClient'
import type { PatientSessionEntry } from '@/types/session.types'
import type { User } from '@/types/user.types'

interface CreatePatientBody {
  fullName: string
  email: string
  phone: string
  issue?: string
}

export const listPatientsRequest = (token: string) => apiRequest<User[]>(API.patients.list, { token })

export const createPatientRequest = (token: string, body: CreatePatientBody) =>
  apiRequest<User>(API.patients.create, { method: 'POST', token, body })

export interface PatientHistory {
  patient: User
  sessions: PatientSessionEntry[]
}

export const getPatientHistoryRequest = (token: string, patientId: string) =>
  apiRequest<PatientHistory>(API.patients.history(patientId), { token })
