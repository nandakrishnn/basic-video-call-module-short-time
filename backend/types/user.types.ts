import type { UserRole } from '../constants/enums'

export interface User {
  id: string
  email: string | null
  phone: string | null
  fullName: string
  role: UserRole
  passwordHash: string | null
  dateOfBirth: string | null
  specialization: string | null
  createdAt: string
  updatedAt: string
}

export interface AuthTokenPayload {
  userId: string
  role: UserRole
}

export interface LoginInput {
  email: string
  password: string
}

export interface RequestOtpInput {
  identifier: string
  sessionId?: string
}

export interface VerifyOtpInput {
  identifier: string
  sessionId?: string
  otp: string
}

export interface CreatePatientInput {
  fullName: string
  email: string
  phone: string
}
