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
router.patch('/:id/start', authenticate, requireRole(UserRole.PHYSIO, UserRole.ADMIN), asyncHandler(startSession))
// Ending a consultation is the clinician's call. This was open to any signed-in
// user, and the patient's hangup button called it — so a mis-tap marked the
// whole session complete while the physio was still in the room, and left the
// patient unable to come back.
router.patch(
  '/:id/end',
  authenticate,
  requireRole(UserRole.PHYSIO, UserRole.ADMIN),
  asyncHandler(endSession),
)
router.get('/:id/join-token', asyncHandler(getJoinToken))
router.post('/:id/share-log', authenticate, asyncHandler(shareLog))

export default router
