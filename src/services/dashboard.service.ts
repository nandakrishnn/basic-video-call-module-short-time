import { API } from '@/constants/api'
import { apiRequest } from '@/lib/apiClient'
import type { AdminDashboardData, PatientDashboardData, PhysioDashboardData } from '@/types/dashboard.types'

export const getPhysioDashboardRequest = (token: string) =>
  apiRequest<PhysioDashboardData>(API.dashboard.physio, { token })

export const getPatientDashboardRequest = (token: string) =>
  apiRequest<PatientDashboardData>(API.dashboard.patient, { token })

export const getAdminDashboardRequest = (token: string) =>
  apiRequest<AdminDashboardData>(API.dashboard.admin, { token })
