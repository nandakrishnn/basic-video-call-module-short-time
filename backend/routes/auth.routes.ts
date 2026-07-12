import { Router } from 'express'
import { z } from 'zod'
import { getMe, login, requestPatientOtp, verifyPatientOtp } from '../controllers/auth.controller'
import { authenticate } from '../middleware/auth.middleware'
import { validateBody } from '../middleware/validate.middleware'
import { asyncHandler } from '../utils/asyncHandler'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

const requestOtpSchema = z.object({
  identifier: z.string().min(1),
  sessionId: z.string().uuid(),
})

const verifyOtpSchema = z.object({
  identifier: z.string().min(1),
  sessionId: z.string().uuid(),
  otp: z.string().length(4),
})

const router = Router()

router.post('/login', validateBody(loginSchema), asyncHandler(login))
router.post('/patient/request-otp', validateBody(requestOtpSchema), asyncHandler(requestPatientOtp))
router.post('/patient/verify-otp', validateBody(verifyOtpSchema), asyncHandler(verifyPatientOtp))
router.get('/me', authenticate, asyncHandler(getMe))

export default router
