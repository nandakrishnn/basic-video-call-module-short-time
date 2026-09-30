import { CONFIG } from '../constants/config'
import { AuditAction, SessionStatus } from '../constants/enums'
import { findAppointmentById, linkAppointmentSession } from '../models/appointment.model'
import { createSessionRecord, findSessionById } from '../models/session.model'
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

/**
 * Where a session falls in that history, counting the patient's first as 1.
 *
 * Only sessions that actually began are counted. A booking that was created
 * but never started — a no-show, a cancellation, a session record left behind
 * — is not something that happened to the patient, and counting it pushed
 * their genuine first session up to "session 2". One that has not started yet
 * takes the number it will have when it does.
 */
export const getSessionNumber = (sessions: Session[], sessionId: string): number => {
  const held = sortSessionsOldestFirst(sessions).filter((session) => session.startedAt !== null)
  const index = held.findIndex((session) => session.id === sessionId)
  return index >= 0 ? index + 1 : held.length + 1
}

export const createSessionForCall = async (params: {
  patientId: string
  physioId: string
  appointmentId?: string
}): Promise<Session> => {
  const { patientId, physioId, appointmentId } = params

  // Starting the same booking twice must not mint a second session. Pressing
  // Start, going back without joining, then pressing Start again left an orphan
  // record behind: it never began, so it surfaced in the patient's history as
  // an extra numbered session with no notes, and pushed every later session's
  // number up by one. A session that already finished is left alone — calling
  // the same patient again is a genuinely new session.
  if (appointmentId) {
    const appointment = await findAppointmentById(appointmentId)
    if (appointment?.sessionId) {
      const existing = await findSessionById(appointment.sessionId)
      const isReusable =
        existing &&
        existing.status !== SessionStatus.COMPLETED &&
        existing.status !== SessionStatus.CANCELLED
      if (isReusable) return existing
    }
  }

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
