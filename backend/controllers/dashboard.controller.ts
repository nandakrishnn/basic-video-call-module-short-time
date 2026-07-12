import type { Request, Response } from 'express'
import { MESSAGES } from '../constants/messages'
import { getAdminDashboard, getPatientDashboard, getPhysioDashboard } from '../services/dashboard.service'
import { successResponse } from '../utils/response'

export const getPhysioDashboardData = async (req: Request, res: Response): Promise<void> => {
  const data = await getPhysioDashboard(req.user!.userId)
  res.status(200).json(successResponse(data, MESSAGES.dashboard.physioSuccess))
}

export const getPatientDashboardData = async (req: Request, res: Response): Promise<void> => {
  const data = await getPatientDashboard(req.user!.userId)
  res.status(200).json(successResponse(data, MESSAGES.dashboard.patientSuccess))
}

export const getAdminDashboardData = async (_req: Request, res: Response): Promise<void> => {
  const data = await getAdminDashboard()
  res.status(200).json(successResponse(data, MESSAGES.dashboard.adminSuccess))
}
