import { Router } from 'express'
import { z } from 'zod'
import { AppointmentType, UserRole } from '../constants/enums'
import {
  cancelAppointment,
  createAppointment,
  getAppointmentsByPatient,
  getAppointmentsByPhysio,
  updateAppointment,
} from '../controllers/appointment.controller'
import { authenticate } from '../middleware/auth.middleware'
import { requireRole } from '../middleware/role.middleware'
import { validateBody } from '../middleware/validate.middleware'
import { asyncHandler } from '../utils/asyncHandler'

const sessionTypeSchema = z.nativeEnum(AppointmentType)

const createAppointmentSchema = z.object({
  patientId: z.string().uuid(),
  scheduledAt: z.string().datetime(),
  durationMinutes: z.number().int().positive().optional(),
  sessionType: sessionTypeSchema,
  internalNote: z.string().optional(),
})

const updateAppointmentSchema = z.object({
  scheduledAt: z.string().datetime().optional(),
  durationMinutes: z.number().int().positive().optional(),
  sessionType: sessionTypeSchema.optional(),
  internalNote: z.string().optional(),
})

const router = Router()

router.post(
  '/create',
  authenticate,
  requireRole(UserRole.PHYSIO, UserRole.ADMIN),
  validateBody(createAppointmentSchema),
  asyncHandler(createAppointment),
)
router.get('/physio/:physioId', authenticate, asyncHandler(getAppointmentsByPhysio))
router.get('/patient/:patientId', authenticate, asyncHandler(getAppointmentsByPatient))
router.patch('/:id', authenticate, validateBody(updateAppointmentSchema), asyncHandler(updateAppointment))
router.delete('/:id', authenticate, asyncHandler(cancelAppointment))

export default router
