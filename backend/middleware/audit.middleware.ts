import type { NextFunction, Request, Response } from 'express'
import type { AuditAction } from '../constants/enums'
import { logAudit } from '../services/audit.service'

export const auditLog = (action: AuditAction, resource: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    res.on('finish', () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        void logAudit({
          userId: req.user?.userId ?? null,
          action,
          resource,
          resourceId: req.params.id,
        })
      }
    })
    next()
  }
}
