import { CONFIG } from '../constants/config'
import { findScheduledAppointmentsWithoutSession } from '../models/appointment.model'
import { parseUtc } from '../utils/date'
import { createSessionForCall } from './session.service'

let isRunning = false

// Auto-creates the call session (and sends the join-link email) once an appointment
// enters its join window — without this, a scheduled appointment would only ever get
// a session/link if the physio manually clicked "Start Call".
export const checkDueAppointments = async (): Promise<void> => {
  if (isRunning) return
  isRunning = true

  try {
    const candidates = await findScheduledAppointmentsWithoutSession()
    const windowMs = CONFIG.session.joinWindowMinutesBeforeStart * 60_000
    const now = Date.now()

    const due = candidates.filter((appointment) => parseUtc(appointment.scheduledAt).getTime() - now <= windowMs)

    for (const appointment of due) {
      try {
        await createSessionForCall({
          patientId: appointment.patientId,
          physioId: appointment.physioId,
          appointmentId: appointment.id,
        })
      } catch (err) {
        console.error(`Failed to auto-create session for appointment ${appointment.id}:`, err)
      }
    }
  } catch (err) {
    console.error('Failed to check due appointments:', err)
  } finally {
    isRunning = false
  }
}
