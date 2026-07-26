import { AppointmentStatus, SessionStatus } from '../constants/enums'
import {
  countAppointmentsByPhysioInRange,
  findAppointmentsByDateRange,
  findAppointmentsByPatient,
  findAppointmentsByPhysio,
} from '../models/appointment.model'
import { findSentNotesByPatient } from '../models/notes.model'
import { findSessionsByPatient, findSessionsByPhysio } from '../models/session.model'
import { findUserById, findUsersByRole } from '../models/user.model'
import type { User } from '../types/user.types'

const SESSIONS_TREND_DAYS = 14
const DAY_MS = 86_400_000

// Bucketed entirely in UTC calendar days, matching how Postgres/Supabase timestamps
// serialize — mixing in local-time midnight (setHours) would roll "today" back a day
// in any positive-UTC-offset timezone once converted via toISOString().
const buildSessionsTrend = (sessions: { startedAt: string | null }[]): { date: string; count: number }[] => {
  const countsByDate = new Map<string, number>()
  for (const session of sessions) {
    if (!session.startedAt) continue
    const date = session.startedAt.slice(0, 10)
    countsByDate.set(date, (countsByDate.get(date) ?? 0) + 1)
  }

  const trend: { date: string; count: number }[] = []
  const todayUtc = new Date(`${new Date().toISOString().slice(0, 10)}T00:00:00.000Z`)

  for (let i = SESSIONS_TREND_DAYS - 1; i >= 0; i--) {
    const date = new Date(todayUtc.getTime() - i * DAY_MS).toISOString().slice(0, 10)
    trend.push({ date, count: countsByDate.get(date) ?? 0 })
  }

  return trend
}

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
  const todayAppointments = allAppointments
    .filter((a) => a.scheduledAt >= todayStart && a.scheduledAt <= todayEnd)
    .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))
  const upcomingThisWeek = allAppointments.filter(
    (a) => a.scheduledAt > todayEnd && a.status === AppointmentStatus.SCHEDULED,
  )
  const recentPatientIds = Array.from(new Set(allAppointments.map((a) => a.patientId))).slice(0, 5)

  const [sessionsToday, sessionsThisWeek, sessionsThisMonth, allSessions, recentPatientUsers] = await Promise.all([
    countAppointmentsByPhysioInRange(physioId, todayStart, todayEnd),
    countAppointmentsByPhysioInRange(physioId, startOfWeek(now).toISOString(), now.toISOString()),
    countAppointmentsByPhysioInRange(physioId, startOfMonth(now).toISOString(), now.toISOString()),
    findSessionsByPhysio(physioId),
    Promise.all(recentPatientIds.map((id) => findUserById(id))),
  ])

  const completedSessions = allSessions.filter((s) => s.status === SessionStatus.COMPLETED)
  const sessionsTrend = buildSessionsTrend(completedSessions)

  const recentPatients = recentPatientUsers
    .filter((p): p is User => p !== null)
    .map((p) => ({ id: p.id, fullName: p.fullName, email: p.email, phone: p.phone }))

  return {
    todayAppointments,
    upcomingThisWeek,
    recentPatients,
    stats: { sessionsToday, sessionsThisWeek, sessionsThisMonth },
    sessionsTrend,
  }
}

export const getPatientDashboard = async (patientId: string) => {
  const appointments = await findAppointmentsByPatient(patientId)
  const now = new Date().toISOString()

  const nextAppointment =
    appointments.find((a) => a.scheduledAt > now && a.status === AppointmentStatus.SCHEDULED) ?? null

  const [sessions, reports] = await Promise.all([findSessionsByPatient(patientId), findSentNotesByPatient(patientId)])
  const completedSessions = sessions.filter((s) => s.status === SessionStatus.COMPLETED)

  const physioIds = Array.from(new Set(completedSessions.map((s) => s.physioId)))
  const physios = await Promise.all(physioIds.map((id) => findUserById(id)))
  const physioNameById = new Map(physios.filter((p): p is User => p !== null).map((p) => [p.id, p.fullName]))

  const pastCalls = completedSessions.map((session) => {
    const report = reports.find((r) => r.sessionId === session.id) ?? null
    return {
      sessionId: session.id,
      physioName: physioNameById.get(session.physioId) ?? 'Your physio',
      startedAt: session.startedAt,
      endedAt: session.endedAt,
      report,
    }
  })

  const totalMinutes = completedSessions.reduce((sum, session) => {
    if (!session.startedAt || !session.endedAt) return sum
    const minutes = (new Date(session.endedAt).getTime() - new Date(session.startedAt).getTime()) / 60_000
    return sum + Math.max(0, Math.round(minutes))
  }, 0)

  return {
    nextAppointment,
    pastCalls,
    stats: { totalCalls: completedSessions.length, totalMinutes },
  }
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
