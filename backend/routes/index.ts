import { Router } from 'express'
import authRoutes from './auth.routes'
import sessionRoutes from './session.routes'

const router = Router()

router.use('/auth', authRoutes)
router.use('/sessions', sessionRoutes)

export default router
