import { Router } from 'express'
import { z } from 'zod'
import { UserRole } from '../constants/enums'
import {
  approveNotes,
  createNotes,
  enhanceNotes,
  generatePdf,
  sendNotes,
} from '../controllers/notes.controller'
import { authenticate } from '../middleware/auth.middleware'
import { requireRole } from '../middleware/role.middleware'
import { validateBody } from '../middleware/validate.middleware'
import { asyncHandler } from '../utils/asyncHandler'

const createNotesSchema = z.object({
  sessionId: z.string().uuid(),
  rawNotes: z.string().min(1),
})

const approveNotesSchema = z.object({
  enhancedNotes: z.string().min(1),
})

const sendNotesSchema = z.object({
  sendToPatient: z.boolean(),
})

const router = Router()

router.post(
  '/create',
  authenticate,
  requireRole(UserRole.PHYSIO),
  validateBody(createNotesSchema),
  asyncHandler(createNotes),
)
router.post('/:id/enhance', authenticate, requireRole(UserRole.PHYSIO), asyncHandler(enhanceNotes))
router.patch(
  '/:id/approve',
  authenticate,
  requireRole(UserRole.PHYSIO),
  validateBody(approveNotesSchema),
  asyncHandler(approveNotes),
)
router.post('/:id/generate-pdf', authenticate, requireRole(UserRole.PHYSIO), asyncHandler(generatePdf))
router.post(
  '/:id/send',
  authenticate,
  requireRole(UserRole.PHYSIO),
  validateBody(sendNotesSchema),
  asyncHandler(sendNotes),
)

export default router
