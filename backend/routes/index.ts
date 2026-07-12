import { Router } from 'express'
import appointmentRoutes from './appointment.routes'
import authRoutes from './auth.routes'
import sessionRoutes from './session.routes'

const router = Router()

router.use('/auth', authRoutes)
router.use('/sessions', sessionRoutes)
router.use('/appointments', appointmentRoutes)

export default router
