import type { Request, Response } from 'express'
import { MESSAGES } from '../constants/messages'
import { AppError } from '../middleware/error.middleware'
import { findAppointmentsByPatient } from '../models/appointment.model'
import { findNotesBySessionIds } from '../models/notes.model'
import { findSessionsByPatient } from '../models/session.model'
import { createPatient, findUserById, findUsersByRole } from '../models/user.model'
import { syncPatientToPhysioPlatform } from '../services/physioPlatformSync.service'
import type { CreatePatientInput } from '../types/user.types'
import { successResponse } from '../utils/response'

export const listPatients = async (_req: Request, res: Response): Promise<void> => {
  const patients = await findUsersByRole('patient')
  res.status(200).json(successResponse(patients, MESSAGES.patient.listSuccess))
}

/**
 * A patient with their whole session history: every session, its appointment
 * type and the notes written against it, numbered from the patient's first
 * session so "session 3" means the same thing wherever it is shown.
 */
export const getPatientHistory = async (req: Request, res: Response): Promise<void> => {
  const patient = await findUserById(req.params.id)
  if (!patient || patient.role !== 'patient') {
    throw new AppError(MESSAGES.auth.userNotFound, 404, 'PATIENT_NOT_FOUND')
  }

  const [sessions, appointments] = await Promise.all([
    findSessionsByPatient(patient.id),
    findAppointmentsByPatient(patient.id),
  ])

  const notes = await findNotesBySessionIds(sessions.map((session) => session.id))
  const notesBySession = new Map(notes.map((note) => [note.sessionId, note]))
  const appointmentById = new Map(appointments.map((appointment) => [appointment.id, appointment]))

  // Numbered oldest-first so a patient's first session is always 1, then
  // returned newest-first because that is the order a physio reads them in.
  const oldestFirst = [...sessions].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  const numbered = oldestFirst.map((session, index) => {
    const appointment = session.appointmentId ? appointmentById.get(session.appointmentId) : undefined
    return {
      ...session,
      sessionNumber: index + 1,
      sessionType: appointment?.sessionType ?? null,
      scheduledAt: appointment?.scheduledAt ?? null,
      notes: notesBySession.get(session.id) ?? null,
    }
  })

  res.status(200).json(
    successResponse({ patient, sessions: numbered.reverse() }, MESSAGES.patient.listSuccess),
  )
}

export const createPatientHandler = async (req: Request, res: Response): Promise<void> => {
  const { fullName, email, phone, issue } = req.body as CreatePatientInput
  const patient = await createPatient({ fullName, email, phone, issue })

  try {
    await syncPatientToPhysioPlatform(patient)
  } catch (err) {
    // The patient is already created here - a failed mirror shouldn't fail the request.
    console.error('Failed to sync patient to physio-platform:', err)
  }

  res.status(201).json(successResponse(patient, MESSAGES.patient.createSuccess))
}
