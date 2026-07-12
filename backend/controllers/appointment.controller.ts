import type { Request, Response } from 'express'
import { AppointmentStatus, AuditAction } from '../constants/enums'
import { CONFIG } from '../constants/config'
import { MESSAGES } from '../constants/messages'
import { AppError } from '../middleware/error.middleware'
import {
  createAppointmentRecord,
  findAppointmentById,
  findAppointmentsByPatient,
  findAppointmentsByPhysio,
  updateAppointmentRecord,
} from '../models/appointment.model'
import { logAudit } from '../services/audit.service'
import type { CreateAppointmentInput, UpdateAppointmentInput } from '../types/appointment.types'
import { successResponse } from '../utils/response'

export const createAppointment = async (req: Request, res: Response): Promise<void> => {
  const { patientId, scheduledAt, durationMinutes, sessionType, internalNote } =
    req.body as CreateAppointmentInput
  const physioId = req.user!.userId

  const appointment = await createAppointmentRecord({
    patientId,
    physioId,
    scheduledAt,
    durationMinutes: durationMinutes ?? CONFIG.session.defaultDurationMinutes,
    sessionType,
    internalNote,
  })

  await logAudit({
    userId: physioId,
    action: AuditAction.APPOINTMENT_SCHEDULED,
    resource: 'appointment',
    resourceId: appointment.id,
  })

  res.status(201).json(successResponse(appointment, MESSAGES.appointment.createSuccess))
}

export const getAppointmentsByPhysio = async (req: Request, res: Response): Promise<void> => {
  const appointments = await findAppointmentsByPhysio(req.params.physioId)
  res.status(200).json(successResponse(appointments, MESSAGES.appointment.fetchSuccess))
}

export const getAppointmentsByPatient = async (req: Request, res: Response): Promise<void> => {
  const appointments = await findAppointmentsByPatient(req.params.patientId)
  res.status(200).json(successResponse(appointments, MESSAGES.appointment.fetchSuccess))
}

export const updateAppointment = async (req: Request, res: Response): Promise<void> => {
  const existing = await findAppointmentById(req.params.id)
  if (!existing) throw new AppError(MESSAGES.appointment.notFound, 404, 'APPOINTMENT_NOT_FOUND')

  const updates = req.body as UpdateAppointmentInput
  const appointment = await updateAppointmentRecord(req.params.id, updates)
  if (!appointment) throw new AppError(MESSAGES.appointment.notFound, 404, 'APPOINTMENT_NOT_FOUND')

  res.status(200).json(successResponse(appointment, MESSAGES.appointment.updateSuccess))
}

export const cancelAppointment = async (req: Request, res: Response): Promise<void> => {
  const existing = await findAppointmentById(req.params.id)
  if (!existing) throw new AppError(MESSAGES.appointment.notFound, 404, 'APPOINTMENT_NOT_FOUND')

  const appointment = await updateAppointmentRecord(req.params.id, { status: AppointmentStatus.CANCELLED })
  if (!appointment) throw new AppError(MESSAGES.appointment.notFound, 404, 'APPOINTMENT_NOT_FOUND')

  res.status(200).json(successResponse(appointment, MESSAGES.appointment.cancelSuccess))
}
