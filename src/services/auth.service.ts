import { API } from '@/constants/api'
import { apiRequest } from '@/lib/apiClient'
import type { User } from '@/types/user.types'

interface AuthPayload {
  token: string
  user: User
}

export const loginRequest = (email: string, password: string) =>
  apiRequest<AuthPayload>(API.auth.login, { method: 'POST', body: { email, password } })

export const requestPatientOtpRequest = (identifier: string, sessionId?: string) =>
  apiRequest<null>(API.auth.patientRequestOtp, { method: 'POST', body: { identifier, sessionId } })

export const verifyPatientOtpRequest = (identifier: string, otp: string, sessionId?: string) =>
  apiRequest<AuthPayload>(API.auth.patientVerifyOtp, { method: 'POST', body: { identifier, sessionId, otp } })

export const getMeRequest = (token: string) => apiRequest<User>(API.auth.me, { token })
