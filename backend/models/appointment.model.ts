import { db } from '../db'
import type { AppointmentStatus, AppointmentType } from '../constants/enums'
import type { Appointment } from '../types/appointment.types'

interface AppointmentRow {
  id: string
  patient_id: string
  physio_id: string
  scheduled_at: string
  duration_minutes: number
  session_type: string
  status: string
  session_id: string | null
  internal_note: string | null
  created_at: string
  updated_at: string
}

const mapRow = (row: AppointmentRow): Appointment => ({
  id: row.id,
  patientId: row.patient_id,
  physioId: row.physio_id,
  scheduledAt: row.scheduled_at,
  durationMinutes: row.duration_minutes,
  sessionType: row.session_type as AppointmentType,
  status: row.status as AppointmentStatus,
  sessionId: row.session_id,
  internalNote: row.internal_note,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
})

export const createAppointmentRecord = async (params: {
  patientId: string
  physioId: string
  scheduledAt: string
  durationMinutes: number
  sessionType: AppointmentType
  internalNote?: string
}): Promise<Appointment> => {
  const { data, error } = await db
    .from('appointments')
    .insert({
      patient_id: params.patientId,
      physio_id: params.physioId,
      scheduled_at: params.scheduledAt,
      duration_minutes: params.durationMinutes,
      session_type: params.sessionType,
      internal_note: params.internalNote ?? null,
    })
    .select('*')
    .single()

  if (error || !data) throw new Error('Failed to create appointment')
  return mapRow(data as AppointmentRow)
}

export const findAppointmentById = async (id: string): Promise<Appointment | null> => {
  const { data, error } = await db.from('appointments').select('*').eq('id', id).maybeSingle()
  if (error || !data) return null
  return mapRow(data as AppointmentRow)
}

export const findAppointmentsByPhysio = async (physioId: string): Promise<Appointment[]> => {
  const { data, error } = await db
    .from('appointments')
    .select('*')
    .eq('physio_id', physioId)
    .order('scheduled_at', { ascending: true })

  if (error || !data) return []
  return (data as AppointmentRow[]).map(mapRow)
}

export const findAppointmentsByPatient = async (patientId: string): Promise<Appointment[]> => {
  const { data, error } = await db
    .from('appointments')
    .select('*')
    .eq('patient_id', patientId)
    .order('scheduled_at', { ascending: true })

  if (error || !data) return []
  return (data as AppointmentRow[]).map(mapRow)
}

export const updateAppointmentRecord = async (
  id: string,
  updates: Partial<{
    scheduledAt: string
    durationMinutes: number
    sessionType: AppointmentType
    status: AppointmentStatus
    internalNote: string
  }>,
): Promise<Appointment | null> => {
  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (updates.scheduledAt !== undefined) payload.scheduled_at = updates.scheduledAt
  if (updates.durationMinutes !== undefined) payload.duration_minutes = updates.durationMinutes
  if (updates.sessionType !== undefined) payload.session_type = updates.sessionType
  if (updates.status !== undefined) payload.status = updates.status
  if (updates.internalNote !== undefined) payload.internal_note = updates.internalNote

  const { data, error } = await db.from('appointments').update(payload).eq('id', id).select('*').single()
  if (error || !data) return null
  return mapRow(data as AppointmentRow)
}

export const findAppointmentsByDateRange = async (start: string, end: string): Promise<Appointment[]> => {
  const { data, error } = await db
    .from('appointments')
    .select('*')
    .gte('scheduled_at', start)
    .lt('scheduled_at', end)
    .order('scheduled_at', { ascending: true })

  if (error || !data) return []
  return (data as AppointmentRow[]).map(mapRow)
}

export const countAppointmentsByPhysioInRange = async (
  physioId: string,
  start: string,
  end: string,
): Promise<number> => {
  const { count, error } = await db
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('physio_id', physioId)
    .gte('scheduled_at', start)
    .lt('scheduled_at', end)

  if (error) return 0
  return count ?? 0
}
