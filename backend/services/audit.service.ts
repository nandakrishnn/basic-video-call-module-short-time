import type { AuditAction } from '../constants/enums'
import { insertAuditLog } from '../models/audit.model'

export interface AuditLogInput {
  userId: string | null
  action: AuditAction
  resource?: string
  resourceId?: string
  metadata?: Record<string, unknown>
  ipAddress?: string
}

export const logAudit = async (input: AuditLogInput): Promise<void> => {
  await insertAuditLog(input)
}
