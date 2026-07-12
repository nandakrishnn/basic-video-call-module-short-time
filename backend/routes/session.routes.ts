import { Router } from 'express'
import { z } from 'zod'
import { UserRole } from '../constants/enums'
import {
  createSession,
  endSession,
  getJoinToken,
  getSession,
  shareLog,
  startSession,
} from '../controllers/session.controller'
import { authenticate } from '../middleware/auth.middleware'
import { requireRole } from '../middleware/role.middleware'
import { validateBody } from '../middleware/validate.middleware'
import { asyncHandler } from '../utils/asyncHandler'

const createSessionSchema = z.object({
  patientId: z.string().uuid(),
  appointmentId: z.string().uuid().optional(),
})

const router = Router()

router.post(
  '/create',
  authenticate,
  requireRole(UserRole.PHYSIO, UserRole.ADMIN),
  validateBody(createSessionSchema),
  asyncHandler(createSession),
)
router.get('/:id', authenticate, asyncHandler(getSession))
router.patch('/:id/start', authenticate, asyncHandler(startSession))
router.patch('/:id/end', authenticate, asyncHandler(endSession))
router.get('/:id/join-token', asyncHandler(getJoinToken))
router.post('/:id/share-log', authenticate, asyncHandler(shareLog))

export default router
