import { API } from '@/constants/api'
import { apiRequest } from '@/lib/apiClient'
import type { User } from '@/types/user.types'

interface CreatePatientBody {
  fullName: string
  email?: string
  phone?: string
}

export const listPatientsRequest = (token: string) => apiRequest<User[]>(API.patients.list, { token })

export const createPatientRequest = (token: string, body: CreatePatientBody) =>
  apiRequest<User>(API.patients.create, { method: 'POST', token, body })
