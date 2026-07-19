import type { Request, Response } from 'express'
import { AuditAction, SessionStatus } from '../constants/enums'
import { MESSAGES } from '../constants/messages'
import { AppError } from '../middleware/error.middleware'
import { findSessionById, updateSessionStatus } from '../models/session.model'
import { logAudit } from '../services/audit.service'
import { createSessionForCall } from '../services/session.service'
import { successResponse } from '../utils/response'

export const createSession = async (req: Request, res: Response): Promise<void> => {
  const { patientId, appointmentId } = req.body as { patientId: string; appointmentId?: string }
  const physioId = req.user!.userId

  const session = await createSessionForCall({ patientId, physioId, appointmentId })

  res.status(201).json(successResponse(session, MESSAGES.session.createSuccess))
}

export const getSession = async (req: Request, res: Response): Promise<void> => {
  const session = await findSessionById(req.params.id)
  if (!session) throw new AppError(MESSAGES.session.notFound, 404, 'SESSION_NOT_FOUND')
  res.status(200).json(successResponse(session, MESSAGES.session.fetchSuccess))
}

export const startSession = async (req: Request, res: Response): Promise<void> => {
  const session = await updateSessionStatus(req.params.id, SessionStatus.ACTIVE, 'started_at')
  if (!session) throw new AppError(MESSAGES.session.notFound, 404, 'SESSION_NOT_FOUND')

  await logAudit({
    userId: req.user?.userId ?? null,
    action: AuditAction.CALL_STARTED,
    resource: 'session',
    resourceId: session.id,
  })

  res.status(200).json(successResponse(session, MESSAGES.session.startSuccess))
}

export const endSession = async (req: Request, res: Response): Promise<void> => {
  const session = await updateSessionStatus(req.params.id, SessionStatus.COMPLETED, 'ended_at')
  if (!session) throw new AppError(MESSAGES.session.notFound, 404, 'SESSION_NOT_FOUND')

  await logAudit({
    userId: req.user?.userId ?? null,
    action: AuditAction.CALL_ENDED,
    resource: 'session',
    resourceId: session.id,
  })

  res.status(200).json(successResponse(session, MESSAGES.session.endSuccess))
}

export const getJoinToken = async (req: Request, res: Response): Promise<void> => {
  const session = await findSessionById(req.params.id)
  if (!session || session.status === SessionStatus.CANCELLED) {
    throw new AppError(MESSAGES.session.joinTokenInvalid, 404, 'INVALID_JOIN_TOKEN')
  }

  res.status(200).json(successResponse(session, MESSAGES.session.joinTokenValid))
}

export const shareLog = async (req: Request, res: Response): Promise<void> => {
  const session = await findSessionById(req.params.id)
  if (!session) throw new AppError(MESSAGES.session.notFound, 404, 'SESSION_NOT_FOUND')

  await logAudit({
    userId: req.user?.userId ?? null,
    action: AuditAction.LINK_SHARED_EMAIL,
    resource: 'session',
    resourceId: session.id,
  })

  res.status(200).json(successResponse(null, MESSAGES.session.shareLogged))
}
