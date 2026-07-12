import type { NextFunction, Request, Response } from 'express'
import type { ZodSchema } from 'zod'
import { MESSAGES } from '../constants/messages'
import { errorResponse } from '../utils/response'

export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      res.status(400).json(errorResponse(MESSAGES.validation.invalidBody, 'VALIDATION_ERROR'))
      return
    }
    req.body = result.data
    next()
  }
}
