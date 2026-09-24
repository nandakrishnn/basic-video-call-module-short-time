import type { NextFunction, Request, Response } from 'express'
import { MESSAGES } from '../constants/messages'
import { errorResponse } from '../utils/response'

export class AppError extends Error {
  public readonly statusCode: number
  public readonly code: string

  constructor(message: string, statusCode: number, code: string) {
    super(message)
    this.statusCode = statusCode
    this.code = code
  }
}

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json(errorResponse(MESSAGES.errors.notFound, 'NOT_FOUND'))
}

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof AppError) {
    // 4xx are expected outcomes (bad input, not found) and would only add noise,
    // but a 5xx is a server-side failure — logging nothing here leaves the real
    // cause invisible, which is exactly how AI_ENHANCE_FAILED became a dead end.
    if (err.statusCode >= 500) {
      console.error(`AppError ${err.statusCode} ${err.code}:`, err.message)
    }
    res.status(err.statusCode).json(errorResponse(err.message, err.code))
    return
  }

  console.error(err)
  res.status(500).json(errorResponse(MESSAGES.errors.internal, 'INTERNAL_ERROR'))
}
