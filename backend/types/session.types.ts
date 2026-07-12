import type { SessionParticipantRole, SessionStatus } from '../constants/enums'

export interface Session {
  id: string
  patientId: string
  physioId: string
  appointmentId: string | null
  roomName: string
  roomLink: string
  status: SessionStatus
  startedAt: string | null
  endedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface SessionParticipant {
  id: string
  sessionId: string
  userId: string
  role: SessionParticipantRole
  joinedAt: string | null
  leftAt: string | null
  otpVerified: boolean
  createdAt: string
}

export interface CreateSessionInput {
  patientId: string
  physioId: string
  appointmentId?: string
}

export interface ShareLogInput {
  channel: 'email'
}
