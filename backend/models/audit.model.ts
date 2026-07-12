import { db } from '../db'

export interface AuditLogRow {
  userId: string | null
  action: string
  resource?: string
  resourceId?: string
  metadata?: Record<string, unknown>
  ipAddress?: string
}

export const insertAuditLog = async (log: AuditLogRow): Promise<void> => {
  const { error } = await db.from('audit_logs').insert({
    user_id: log.userId,
    action: log.action,
    resource: log.resource ?? null,
    resource_id: log.resourceId ?? null,
    metadata: log.metadata ?? null,
    ip_address: log.ipAddress ?? null,
  })
  if (error) console.error('Failed to write audit log', error)
}
