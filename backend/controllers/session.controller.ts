import type { Request, Response } from 'express'
import { AuditAction, SessionStatus, UserRole } from '../constants/enums'
import { MESSAGES } from '../constants/messages'
import { AppError } from '../middleware/error.middleware'
import { findSessionById, updateSessionStatus } from '../models/session.model'
import { findUserById } from '../models/user.model'
import { logAudit } from '../services/audit.service'
import { generateJitsiToken, getJitsiRoomPath } from '../services/jitsi.service'
import { createSessionForCall } from '../services/session.service'
import type { Session } from '../types/session.types'
import { successResponse } from '../utils/response'

const withJitsiToken = async (session: Session, userId: string, role: UserRole) => {
  const user = await findUserById(userId)

  let jitsiJwt: string | null = null
  try {
    jitsiJwt = generateJitsiToken({
      roomName: session.roomName,
      name: user?.fullName ?? 'Guest',
      email: user?.email ?? null,
      moderator: role === UserRole.PHYSIO,
    })
  } catch (err) {
    // A misconfigured JAAS_PRIVATE_KEY shouldn't break session creation/lookup —
    // fall back to no token so the rest of the request still succeeds.
    console.error('Failed to generate Jitsi JWT:', err)
  }

  return { ...session, jitsiJwt, jitsiRoomName: getJitsiRoomPath(session.roomName) }
}

export const createSession = async (req: Request, res: Response): Promise<void> => {
  const { patientId, appointmentId } = req.body as { patientId: string; appointmentId?: string }
  const physioId = req.user!.userId

  const session = await createSessionForCall({ patientId, physioId, appointmentId })
  const responseBody = await withJitsiToken(session, req.user!.userId, req.user!.role)

  res.status(201).json(successResponse(responseBody, MESSAGES.session.createSuccess))
}

export const getSession = async (req: Request, res: Response): Promise<void> => {
  const session = await findSessionById(req.params.id)
  if (!session) throw new AppError(MESSAGES.session.notFound, 404, 'SESSION_NOT_FOUND')
  const responseBody = await withJitsiToken(session, req.user!.userId, req.user!.role)
  res.status(200).json(successResponse(responseBody, MESSAGES.session.fetchSuccess))
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

  const patient = await findUserById(session.patientId)
  const patientIdentifier = patient?.phone ?? patient?.email ?? null

  res.status(200).json(successResponse({ ...session, patientIdentifier }, MESSAGES.session.joinTokenValid))
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
