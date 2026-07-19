import { db } from '../db'
import type { SessionStatus } from '../constants/enums'
import type { Session } from '../types/session.types'

interface SessionRow {
  id: string
  patient_id: string
  physio_id: string
  appointment_id: string | null
  room_name: string
  room_link: string
  status: string
  started_at: string | null
  ended_at: string | null
  created_at: string
  updated_at: string
}

const mapRow = (row: SessionRow): Session => ({
  id: row.id,
  patientId: row.patient_id,
  physioId: row.physio_id,
  appointmentId: row.appointment_id,
  roomName: row.room_name,
  roomLink: row.room_link,
  status: row.status as Session['status'],
  startedAt: row.started_at,
  endedAt: row.ended_at,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
})

export const createSessionRecord = async (params: {
  patientId: string
  physioId: string
  appointmentId?: string
  roomName: string
  roomLink: string
}): Promise<Session> => {
  const { data, error } = await db
    .from('sessions')
    .insert({
      patient_id: params.patientId,
      physio_id: params.physioId,
      appointment_id: params.appointmentId ?? null,
      room_name: params.roomName,
      room_link: params.roomLink,
    })
    .select('*')
    .single()

  if (error || !data) throw new Error('Failed to create session')
  return mapRow(data as SessionRow)
}

export const findSessionById = async (id: string): Promise<Session | null> => {
  const { data, error } = await db.from('sessions').select('*').eq('id', id).maybeSingle()
  if (error || !data) return null
  return mapRow(data as SessionRow)
}

export const findSessionsByPatient = async (patientId: string): Promise<Session[]> => {
  const { data, error } = await db
    .from('sessions')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false })

  if (error || !data) return []
  return (data as SessionRow[]).map(mapRow)
}

export const findSessionsByPhysio = async (physioId: string): Promise<Session[]> => {
  const { data, error } = await db
    .from('sessions')
    .select('*')
    .eq('physio_id', physioId)
    .order('created_at', { ascending: false })

  if (error || !data) return []
  return (data as SessionRow[]).map(mapRow)
}

export const updateSessionStatus = async (
  id: string,
  status: SessionStatus,
  timestampField?: 'started_at' | 'ended_at',
): Promise<Session | null> => {
  const updatePayload: Record<string, unknown> = { status, updated_at: new Date().toISOString() }
  if (timestampField) updatePayload[timestampField] = new Date().toISOString()

  const { data, error } = await db.from('sessions').update(updatePayload).eq('id', id).select('*').single()
  if (error || !data) return null
  return mapRow(data as SessionRow)
}
