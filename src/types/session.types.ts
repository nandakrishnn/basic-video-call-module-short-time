export type SessionStatus = 'scheduled' | 'active' | 'completed' | 'cancelled'
export type SessionParticipantRole = 'physio' | 'patient'

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
  patientIdentifier?: string | null
  // Present when JaaS is configured server-side; null on the public demo server.
  jitsiJwt?: string | null
  jitsiRoomName?: string
}

export interface JitsiConfig {
  roomName: string
  domain: string
  displayName: string
}
