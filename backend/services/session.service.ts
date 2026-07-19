import { CONFIG } from '../constants/config'
import { AuditAction } from '../constants/enums'
import { linkAppointmentSession } from '../models/appointment.model'
import { createSessionRecord } from '../models/session.model'
import { findUserById } from '../models/user.model'
import type { Session } from '../types/session.types'
import { logAudit } from './audit.service'
import { sendCallStartingEmail } from './email.service'
import { generateRoomLink, generateRoomName } from './jitsi.service'

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
