import type { NextFunction, Request, Response } from 'express'
import type { UserRole } from '../constants/enums'
import { MESSAGES } from '../constants/messages'
import { errorResponse } from '../utils/response'

export const requireRole = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json(errorResponse(MESSAGES.auth.forbidden, 'FORBIDDEN'))
      return
    }
    next()
  }
}
