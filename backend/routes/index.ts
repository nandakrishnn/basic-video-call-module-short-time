import { Router } from 'express'
import appointmentRoutes from './appointment.routes'
import authRoutes from './auth.routes'
import dashboardRoutes from './dashboard.routes'
import notesRoutes from './notes.routes'
import sessionRoutes from './session.routes'

const router = Router()

router.use('/auth', authRoutes)
router.use('/sessions', sessionRoutes)
router.use('/appointments', appointmentRoutes)
router.use('/notes', notesRoutes)
router.use('/dashboard', dashboardRoutes)

export default router
