import { API } from '@/constants/api'
import { apiRequest } from '@/lib/apiClient'
import type { Session } from '@/types/session.types'

export const createSessionRequest = (token: string, patientId: string, appointmentId?: string) =>
  apiRequest<Session>(API.sessions.create, { method: 'POST', token, body: { patientId, appointmentId } })

export const getSessionRequest = (token: string, sessionId: string) =>
  apiRequest<Session>(API.sessions.detail(sessionId), { token })

export const startSessionRequest = (token: string, sessionId: string) =>
  apiRequest<Session>(API.sessions.start(sessionId), { method: 'PATCH', token })

export const endSessionRequest = (token: string, sessionId: string) =>
  apiRequest<Session>(API.sessions.end(sessionId), { method: 'PATCH', token })

export const getJoinTokenRequest = (sessionId: string) =>
  apiRequest<Session>(API.sessions.joinToken(sessionId))

export const shareLogRequest = (token: string, sessionId: string) =>
  apiRequest<null>(API.sessions.shareLog(sessionId), { method: 'POST', token })
