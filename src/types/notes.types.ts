export interface SessionNotes {
  id: string
  sessionId: string
  physioId: string
  rawNotes: string
  enhancedNotes: string | null
  isSentToPatient: boolean
  sentAt: string | null
  pdfUrl: string | null
}
