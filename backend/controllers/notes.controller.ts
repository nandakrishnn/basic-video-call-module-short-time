import type { Request, Response } from 'express'
import { AuditAction } from '../constants/enums'
import { MESSAGES } from '../constants/messages'
import { AppError } from '../middleware/error.middleware'
import { createNotesRecord, findNotesById, updateNotesRecord } from '../models/notes.model'
import { findSessionById } from '../models/session.model'
import { findUserById } from '../models/user.model'
import { logAudit } from '../services/audit.service'
import { sendReportEmail } from '../services/email.service'
import { enhanceNotesWithAI } from '../services/gemini.service'
import { generateReportPdf } from '../services/pdf.service'
import { uploadPdf } from '../services/storage.service'
import type { ApproveNotesInput, CreateNotesInput, SendNotesInput } from '../types/notes.types'
import { successResponse } from '../utils/response'

export const createNotes = async (req: Request, res: Response): Promise<void> => {
  const { sessionId, rawNotes } = req.body as CreateNotesInput
  const physioId = req.user!.userId

  const notes = await createNotesRecord({ sessionId, physioId, rawNotes })

  await logAudit({
    userId: physioId,
    action: AuditAction.NOTES_CREATED,
    resource: 'session_notes',
    resourceId: notes.id,
  })

  res.status(201).json(successResponse(notes, MESSAGES.notes.createSuccess))
}

export const enhanceNotes = async (req: Request, res: Response): Promise<void> => {
  const notes = await findNotesById(req.params.id)
  if (!notes) throw new AppError(MESSAGES.notes.notFound, 404, 'NOTES_NOT_FOUND')

  let enhancedNotes: string
  try {
    enhancedNotes = await enhanceNotesWithAI(notes.rawNotes)
  } catch {
    throw new AppError(MESSAGES.notes.enhanceFailed, 502, 'AI_ENHANCE_FAILED')
  }

  const updated = await updateNotesRecord(notes.id, { enhancedNotes })
  if (!updated) throw new AppError(MESSAGES.notes.notFound, 404, 'NOTES_NOT_FOUND')

  await logAudit({
    userId: req.user?.userId ?? null,
    action: AuditAction.NOTES_ENHANCED,
    resource: 'session_notes',
    resourceId: notes.id,
  })

  res.status(200).json(successResponse(updated, MESSAGES.notes.enhanceSuccess))
}

export const approveNotes = async (req: Request, res: Response): Promise<void> => {
  const { enhancedNotes } = req.body as ApproveNotesInput
  const updated = await updateNotesRecord(req.params.id, { enhancedNotes })
  if (!updated) throw new AppError(MESSAGES.notes.notFound, 404, 'NOTES_NOT_FOUND')

  await logAudit({
    userId: req.user?.userId ?? null,
    action: AuditAction.NOTES_APPROVED,
    resource: 'session_notes',
    resourceId: updated.id,
  })

  res.status(200).json(successResponse(updated, MESSAGES.notes.approveSuccess))
}

export const generatePdf = async (req: Request, res: Response): Promise<void> => {
  const notes = await findNotesById(req.params.id)
  if (!notes || !notes.enhancedNotes) throw new AppError(MESSAGES.notes.notFound, 404, 'NOTES_NOT_FOUND')

  const session = await findSessionById(notes.sessionId)
  if (!session) throw new AppError(MESSAGES.session.notFound, 404, 'SESSION_NOT_FOUND')

  const [patient, physio] = await Promise.all([findUserById(session.patientId), findUserById(session.physioId)])
  if (!patient || !physio) throw new AppError(MESSAGES.auth.userNotFound, 404, 'USER_NOT_FOUND')

  const pdfBuffer = await generateReportPdf({
    patientName: patient.fullName,
    patientDob: patient.dateOfBirth,
    sessionDate: new Date(session.startedAt ?? notes.createdAt).toLocaleDateString(),
    sessionNumber: 1,
    physioName: physio.fullName,
    physioSpecialization: physio.specialization,
    enhancedNotes: notes.enhancedNotes,
    nextAppointment: null,
  })

  const pdfUrl = await uploadPdf(`${notes.id}.pdf`, pdfBuffer)
  const updated = await updateNotesRecord(notes.id, { pdfUrl })
  if (!updated) throw new AppError(MESSAGES.notes.notFound, 404, 'NOTES_NOT_FOUND')

  await logAudit({
    userId: req.user?.userId ?? null,
    action: AuditAction.PDF_GENERATED,
    resource: 'session_notes',
    resourceId: notes.id,
  })

  res.status(200).json(successResponse(updated, MESSAGES.notes.pdfGenerated))
}

export const sendNotes = async (req: Request, res: Response): Promise<void> => {
  const { sendToPatient } = req.body as SendNotesInput
  const notes = await findNotesById(req.params.id)
  if (!notes) throw new AppError(MESSAGES.notes.notFound, 404, 'NOTES_NOT_FOUND')

  if (!sendToPatient) {
    res.status(200).json(successResponse(notes, MESSAGES.notes.createSuccess))
    return
  }

  if (!notes.pdfUrl) throw new AppError(MESSAGES.notes.notFound, 404, 'NOTES_NOT_FOUND')

  const session = await findSessionById(notes.sessionId)
  if (!session) throw new AppError(MESSAGES.session.notFound, 404, 'SESSION_NOT_FOUND')

  const patient = await findUserById(session.patientId)
  if (!patient?.email) throw new AppError(MESSAGES.auth.userNotFound, 404, 'USER_NOT_FOUND')

  await sendReportEmail(patient.email, notes.pdfUrl)

  const updated = await updateNotesRecord(notes.id, {
    isSentToPatient: true,
    sentAt: new Date().toISOString(),
  })
  if (!updated) throw new AppError(MESSAGES.notes.notFound, 404, 'NOTES_NOT_FOUND')

  await logAudit({
    userId: req.user?.userId ?? null,
    action: AuditAction.REPORT_SENT,
    resource: 'session_notes',
    resourceId: notes.id,
  })

  res.status(200).json(successResponse(updated, MESSAGES.notes.sendSuccess))
}
