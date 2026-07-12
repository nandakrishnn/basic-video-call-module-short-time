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
    res.status(err.statusCode).json(errorResponse(err.message, err.code))
    return
  }

  console.error(err)
  res.status(500).json(errorResponse(MESSAGES.errors.internal, 'INTERNAL_ERROR'))
}
