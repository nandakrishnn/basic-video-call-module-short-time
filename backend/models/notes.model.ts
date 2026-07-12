import { db } from '../db'
import type { SessionNotes } from '../types/notes.types'

interface NotesRow {
  id: string
  session_id: string
  physio_id: string
  raw_notes: string
  enhanced_notes: string | null
  is_sent_to_patient: boolean
  sent_at: string | null
  pdf_url: string | null
  created_at: string
  updated_at: string
}

const mapRow = (row: NotesRow): SessionNotes => ({
  id: row.id,
  sessionId: row.session_id,
  physioId: row.physio_id,
  rawNotes: row.raw_notes,
  enhancedNotes: row.enhanced_notes,
  isSentToPatient: row.is_sent_to_patient,
  sentAt: row.sent_at,
  pdfUrl: row.pdf_url,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
})

export const createNotesRecord = async (params: {
  sessionId: string
  physioId: string
  rawNotes: string
}): Promise<SessionNotes> => {
  const { data, error } = await db
    .from('session_notes')
    .insert({ session_id: params.sessionId, physio_id: params.physioId, raw_notes: params.rawNotes })
    .select('*')
    .single()

  if (error || !data) throw new Error('Failed to create notes')
  return mapRow(data as NotesRow)
}

export const findNotesById = async (id: string): Promise<SessionNotes | null> => {
  const { data, error } = await db.from('session_notes').select('*').eq('id', id).maybeSingle()
  if (error || !data) return null
  return mapRow(data as NotesRow)
}

interface SentNoteRow {
  id: string
  pdf_url: string | null
  sent_at: string | null
}

export const findSentNotesByPatient = async (
  patientId: string,
): Promise<{ id: string; pdfUrl: string; sentAt: string }[]> => {
  const { data, error } = await db
    .from('session_notes')
    .select('id, pdf_url, sent_at, sessions!inner(patient_id)')
    .eq('sessions.patient_id', patientId)
    .eq('is_sent_to_patient', true)

  if (error || !data) return []
  return (data as unknown as SentNoteRow[])
    .filter((row) => row.pdf_url)
    .map((row) => ({ id: row.id, pdfUrl: row.pdf_url as string, sentAt: row.sent_at ?? '' }))
}

export const updateNotesRecord = async (
  id: string,
  updates: Partial<{
    enhancedNotes: string
    isSentToPatient: boolean
    sentAt: string
    pdfUrl: string
  }>,
): Promise<SessionNotes | null> => {
  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (updates.enhancedNotes !== undefined) payload.enhanced_notes = updates.enhancedNotes
  if (updates.isSentToPatient !== undefined) payload.is_sent_to_patient = updates.isSentToPatient
  if (updates.sentAt !== undefined) payload.sent_at = updates.sentAt
  if (updates.pdfUrl !== undefined) payload.pdf_url = updates.pdfUrl

  const { data, error } = await db.from('session_notes').update(payload).eq('id', id).select('*').single()
  if (error || !data) return null
  return mapRow(data as NotesRow)
}
