import type { NextFunction, Request, Response } from 'express'
import { MESSAGES } from '../constants/messages'
import { errorResponse } from '../utils/response'
import { verifyToken } from '../utils/token'

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const header = req.headers.authorization
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined

  if (!token) {
    res.status(401).json(errorResponse(MESSAGES.auth.unauthorized, 'UNAUTHENTICATED'))
    return
  }

  try {
    req.user = verifyToken(token)
    next()
  } catch {
    res.status(401).json(errorResponse(MESSAGES.auth.invalidToken, 'INVALID_TOKEN'))
  }
}
