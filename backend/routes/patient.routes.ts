import { Router } from 'express'
import { z } from 'zod'
import { UserRole } from '../constants/enums'
import { createPatientHandler, listPatients } from '../controllers/patient.controller'
import { authenticate } from '../middleware/auth.middleware'
import { requireRole } from '../middleware/role.middleware'
import { validateBody } from '../middleware/validate.middleware'
import { asyncHandler } from '../utils/asyncHandler'

const createPatientSchema = z.object({
  fullName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
})

const router = Router()

router.get('/', authenticate, requireRole(UserRole.PHYSIO, UserRole.ADMIN), asyncHandler(listPatients))
router.post(
  '/create',
  authenticate,
  requireRole(UserRole.PHYSIO, UserRole.ADMIN),
  validateBody(createPatientSchema),
  asyncHandler(createPatientHandler),
)

export default router
