import { API } from '@/constants/api'
import { apiRequest } from '@/lib/apiClient'
import type { SessionNotes } from '@/types/notes.types'

export const createNotesRequest = (token: string, sessionId: string, rawNotes: string) =>
  apiRequest<SessionNotes>(API.notes.create, { method: 'POST', token, body: { sessionId, rawNotes } })

/** rawNotes carries the physio's current text, which the stored copy may predate. */
export const enhanceNotesRequest = (token: string, notesId: string, rawNotes: string) =>
  apiRequest<SessionNotes>(API.notes.enhance(notesId), { method: 'POST', token, body: { rawNotes } })

export const approveNotesRequest = (token: string, notesId: string, enhancedNotes: string) =>
  apiRequest<SessionNotes>(API.notes.approve(notesId), { method: 'PATCH', token, body: { enhancedNotes } })

export const generatePdfRequest = (token: string, notesId: string) =>
  apiRequest<SessionNotes>(API.notes.generatePdf(notesId), { method: 'POST', token })

export const sendNotesRequest = (token: string, notesId: string, sendToPatient: boolean) =>
  apiRequest<SessionNotes>(API.notes.send(notesId), { method: 'POST', token, body: { sendToPatient } })
