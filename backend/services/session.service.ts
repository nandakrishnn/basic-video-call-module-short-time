import { CONFIG } from '../constants/config'
import { AuditAction } from '../constants/enums'
import { linkAppointmentSession } from '../models/appointment.model'
import { createSessionRecord } from '../models/session.model'
import { findUserById } from '../models/user.model'
import type { Session } from '../types/session.types'
import { logAudit } from './audit.service'
import { sendCallStartingEmail } from './email.service'
import { generateRoomLink, generateRoomName } from './jitsi.service'

/**
 * A patient's sessions in the order they happened.
 *
 * Session numbers are positions in this list, and they appear in two places —
 * the patient's history and the report sent to them. Both order by the same
 * rule from here so "session 3" cannot mean one thing on screen and another
 * on the PDF.
 */
export const sortSessionsOldestFirst = (sessions: Session[]): Session[] =>
  [...sessions].sort((a, b) => a.createdAt.localeCompare(b.createdAt))

/** Where a session falls in that history, counting the patient's first as 1. */
export const getSessionNumber = (sessions: Session[], sessionId: string): number => {
  const index = sortSessionsOldestFirst(sessions).findIndex((session) => session.id === sessionId)
  return index >= 0 ? index + 1 : 1
}

export const createSessionForCall = async (params: {
  patientId: string
  physioId: string
  appointmentId?: string
}): Promise<Session> => {
  const { patientId, physioId, appointmentId } = params

  const roomName = generateRoomName(physioId, patientId)
  const roomLink = generateRoomLink(roomName)
  const session = await createSessionRecord({ patientId, physioId, appointmentId, roomName, roomLink })

  if (appointmentId) {
    await linkAppointmentSession(appointmentId, session.id)
  }

  await logAudit({
    userId: physioId,
    action: AuditAction.SESSION_LINK_GENERATED,
    resource: 'session',
    resourceId: session.id,
  })

  const [patient, physio] = await Promise.all([findUserById(patientId), findUserById(physioId)])
  if (patient?.email) {
    try {
      await sendCallStartingEmail(patient.email, {
        patientName: patient.fullName,
        physioName: physio?.fullName ?? 'your physio',
        joinLink: `${CONFIG.app.url}/session/join/${session.id}`,
      })
    } catch (err) {
      // Session is already created — a failed notification email shouldn't fail the request.
      console.error('Failed to send call-starting email:', err)
    }
  }

  return session
}
