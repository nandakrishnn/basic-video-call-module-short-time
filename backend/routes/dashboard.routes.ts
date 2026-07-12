import { Router } from 'express'
import { UserRole } from '../constants/enums'
import {
  getAdminDashboardData,
  getPatientDashboardData,
  getPhysioDashboardData,
} from '../controllers/dashboard.controller'
import { authenticate } from '../middleware/auth.middleware'
import { requireRole } from '../middleware/role.middleware'
import { asyncHandler } from '../utils/asyncHandler'

const router = Router()

router.get('/physio', authenticate, requireRole(UserRole.PHYSIO), asyncHandler(getPhysioDashboardData))
router.get('/patient', authenticate, requireRole(UserRole.PATIENT), asyncHandler(getPatientDashboardData))
router.get('/admin', authenticate, requireRole(UserRole.ADMIN), asyncHandler(getAdminDashboardData))

export default router
