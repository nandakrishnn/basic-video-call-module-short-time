import { CONFIG } from '../constants/config'
import { AppointmentStatus, SessionStatus } from '../constants/enums'
import {
  countAppointmentsByPhysioInRange,
  findAppointmentsByDateRange,
  findAppointmentsByPatient,
  findAppointmentsByPhysio,
} from '../models/appointment.model'
import { findNotesBySessionIds } from '../models/notes.model'
import { findSessionsByPatient, findSessionsByPhysio } from '../models/session.model'
import { findUserById, findUsersByRole } from '../models/user.model'
import { getSessionNumber } from '../services/session.service'
import { getSignedPdfUrl } from '../services/storage.service'
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

  // Sessions that happened but whose report never reached the patient — either
  // the write-up was skipped, or it was written and the send declined. Nothing
  // surfaced these, so they were only found by remembering they existed.
  const completedNotes = await findNotesBySessionIds(completedSessions.map((s) => s.id))
  const notesByCompletedSession = new Map(completedNotes.map((note) => [note.sessionId, note]))

  const outstanding = completedSessions
    .filter((session) => !notesByCompletedSession.get(session.id)?.isSentToPatient)
    .sort((a, b) => (b.startedAt ?? b.createdAt).localeCompare(a.startedAt ?? a.createdAt))

  const outstandingPatients = await Promise.all(
    Array.from(new Set(outstanding.map((s) => s.patientId))).map((id) => findUserById(id)),
  )
  const outstandingNameById = new Map(
    outstandingPatients.filter((p): p is User => p !== null).map((p) => [p.id, p.fullName]),
  )

  const pendingReports = outstanding.map((session) => ({
    sessionId: session.id,
    patientId: session.patientId,
    patientName: outstandingNameById.get(session.patientId) ?? 'Patient',
    heldAt: session.startedAt ?? session.createdAt,
    hasNotes: Boolean(notesByCompletedSession.get(session.id)),
  }))

  const recentPatients = recentPatientUsers
    .filter((p): p is User => p !== null)
    .map((p) => ({ id: p.id, fullName: p.fullName, email: p.email, phone: p.phone }))

  return {
    todayAppointments,
    upcomingThisWeek,
    recentPatients,
    stats: { sessionsToday, sessionsThisWeek, sessionsThisMonth },
    sessionsTrend,
    pendingReports,
  }
}

export const getPatientDashboard = async (patientId: string) => {
  const appointments = await findAppointmentsByPatient(patientId)
  const now = new Date().toISOString()

  const sessions = await findSessionsByPatient(patientId)
  const completedSessions = sessions.filter((s) => s.status === SessionStatus.COMPLETED)

  // A booking whose call has already happened is not something to join again.
  // The appointment stays SCHEDULED until the physio confirms it afterwards, so
  // on its own that status kept offering Join over a finished session.
  const finishedSessionIds = new Set(
    sessions
      .filter((s) => s.status === SessionStatus.COMPLETED || s.status === SessionStatus.CANCELLED)
      .map((s) => s.id),
  )

  // A booking the patient can still act on: not yet completed by the physio,
  // and not already held. The slot time is deliberately not a cut-off — it was,
  // and a session the physio started late vanished from the patient's dashboard
  // the moment its scheduled minute passed, taking the join button with it.
  const isOpen = (a: (typeof appointments)[number]): boolean =>
    a.status === AppointmentStatus.SCHEDULED && !(a.sessionId && finishedSessionIds.has(a.sessionId))

  // An overdue booking stops being shown once it is clearly not happening —
  // without a bound, a no-show the physio never marked complete would keep
  // offering a join button for ever.
  const overdueCutoff = new Date(
    Date.now() - CONFIG.session.overdueVisibleHours * 60 * 60 * 1000,
  ).toISOString()

  // Ordered by scheduled_at ascending, so the soonest still to come wins; with
  // none ahead, the latest recently-overdue one is what the patient is waiting on.
  const open = appointments.filter(isOpen)
  const nextAppointment =
    open.find((a) => a.scheduledAt > now) ??
    open.filter((a) => a.scheduledAt <= now && a.scheduledAt >= overdueCutoff).pop() ??
    null

  const notes = await findNotesBySessionIds(completedSessions.map((s) => s.id))
  const notesBySession = new Map(notes.map((note) => [note.sessionId, note]))

  const physioIds = Array.from(new Set(completedSessions.map((s) => s.physioId)))
  const physios = await Promise.all(physioIds.map((id) => findUserById(id)))
  const physioNameById = new Map(physios.filter((p): p is User => p !== null).map((p) => [p.id, p.fullName]))

  // pdf_url holds a path in a private bucket, so it is signed here rather than
  // handed over raw — the patient's browser cannot read the bucket directly and
  // an unsigned path opens nothing at all.
  const pastCalls = await Promise.all(
    completedSessions.map(async (session) => {
      // Only what the physio chose to send. Notes they wrote but have not sent
      // are a draft of a clinical record, and publishing them here would take
      // that decision away from them.
      const note = notesBySession.get(session.id) ?? null
      const shared = note?.isSentToPatient ? note : null

      const signedUrl = shared?.pdfUrl
        ? await getSignedPdfUrl(shared.pdfUrl, CONFIG.reports.signedUrlMinutes * 60)
        : null

      return {
        sessionId: session.id,
        // Numbered the same way as the physio's history, so a patient asking
        // about "session 3" means the session their physio has open.
        sessionNumber: getSessionNumber(sessions, session.id),
        physioName: physioNameById.get(session.physioId) ?? 'Your physio',
        startedAt: session.startedAt,
        endedAt: session.endedAt,
        notes: shared ? (shared.enhancedNotes ?? shared.rawNotes) : null,
        report:
          shared && signedUrl
            ? { id: shared.id, sessionId: shared.sessionId, pdfUrl: signedUrl, sentAt: shared.sentAt ?? '' }
            : null,
      }
    }),
  )

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
