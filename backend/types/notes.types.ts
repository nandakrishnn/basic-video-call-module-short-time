export interface SessionNotes {
  id: string
  sessionId: string
  physioId: string
  rawNotes: string
  enhancedNotes: string | null
  isSentToPatient: boolean
  sentAt: string | null
  pdfUrl: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateNotesInput {
  sessionId: string
  rawNotes: string
}

export interface ApproveNotesInput {
  enhancedNotes: string
}

export interface SendNotesInput {
  sendToPatient: boolean
}
