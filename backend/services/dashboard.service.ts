import { AppointmentStatus } from '../constants/enums'
import {
  countAppointmentsByPhysioInRange,
  findAppointmentsByDateRange,
  findAppointmentsByPatient,
  findAppointmentsByPhysio,
} from '../models/appointment.model'
import { findSentNotesByPatient } from '../models/notes.model'
import { findUsersByRole } from '../models/user.model'

const startOfDay = (date: Date): string => {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

const endOfDay = (date: Date): string => {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d.toISOString()
}

const startOfWeek = (date: Date): Date => {
  const d = new Date(date)
  d.setDate(d.getDate() - d.getDay())
  d.setHours(0, 0, 0, 0)
  return d
}

const startOfMonth = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), 1)

export const getPhysioDashboard = async (physioId: string) => {
  const now = new Date()
  const todayStart = startOfDay(now)
  const todayEnd = endOfDay(now)

  const allAppointments = await findAppointmentsByPhysio(physioId)
  const todayAppointments = allAppointments.filter((a) => a.scheduledAt >= todayStart && a.scheduledAt <= todayEnd)
  const upcomingThisWeek = allAppointments.filter(
    (a) => a.scheduledAt > todayEnd && a.status === AppointmentStatus.SCHEDULED,
  )
  const recentPatientIds = Array.from(new Set(allAppointments.map((a) => a.patientId))).slice(0, 5)

  const [sessionsToday, sessionsThisWeek, sessionsThisMonth] = await Promise.all([
    countAppointmentsByPhysioInRange(physioId, todayStart, todayEnd),
    countAppointmentsByPhysioInRange(physioId, startOfWeek(now).toISOString(), now.toISOString()),
    countAppointmentsByPhysioInRange(physioId, startOfMonth(now).toISOString(), now.toISOString()),
  ])

  return {
    todayAppointments,
    upcomingThisWeek,
    recentPatientIds,
    stats: { sessionsToday, sessionsThisWeek, sessionsThisMonth },
  }
}

export const getPatientDashboard = async (patientId: string) => {
  const appointments = await findAppointmentsByPatient(patientId)
  const now = new Date().toISOString()

  const nextAppointment =
    appointments.find((a) => a.scheduledAt > now && a.status === AppointmentStatus.SCHEDULED) ?? null
  const pastSessions = appointments.filter(
    (a) => a.scheduledAt <= now || a.status === AppointmentStatus.COMPLETED,
  )
  const reports = await findSentNotesByPatient(patientId)

  return { nextAppointment, pastSessions, reports }
}

export const getAdminDashboard = async () => {
  const now = new Date()
  const todayStart = startOfDay(now)
  const todayEnd = endOfDay(now)

  const [todayAppointments, physios, patients] = await Promise.all([
    findAppointmentsByDateRange(todayStart, todayEnd),
    findUsersByRole('physio'),
    findUsersByRole('patient'),
  ])

  return {
    todayAppointments,
    physios: physios.map((p) => ({ id: p.id, fullName: p.fullName })),
    patients: patients.map((p) => ({ id: p.id, fullName: p.fullName })),
    stats: {
      totalAppointmentsToday: todayAppointments.length,
      totalPhysios: physios.length,
      totalPatients: patients.length,
    },
  }
}
