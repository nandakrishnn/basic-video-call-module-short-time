import type { Request, Response } from 'express'
import { UserRole } from '../constants/enums'
import { MESSAGES } from '../constants/messages'
import { AppError } from '../middleware/error.middleware'
import { requestOtp, verifyOtp } from '../services/otp.service'
import {
  createPatientUser,
  findUserByEmail,
  findUserById,
  findUserByIdentifier,
} from '../models/user.model'
import type { LoginInput, RequestOtpInput, VerifyOtpInput } from '../types/user.types'
import { compareValue } from '../utils/hash'
import { successResponse } from '../utils/response'
import { generateToken } from '../utils/token'

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as LoginInput

  const user = await findUserByEmail(email)
  if (!user || !user.passwordHash || user.role === UserRole.PATIENT) {
    throw new AppError(MESSAGES.auth.invalidCredentials, 401, 'INVALID_CREDENTIALS')
  }

  const isValid = await compareValue(password, user.passwordHash)
  if (!isValid) {
    throw new AppError(MESSAGES.auth.invalidCredentials, 401, 'INVALID_CREDENTIALS')
  }

  const token = generateToken({ userId: user.id, role: user.role })
  res.status(200).json(successResponse({ token, user }, MESSAGES.auth.loginSuccess))
}

export const requestPatientOtp = async (req: Request, res: Response): Promise<void> => {
  const { identifier, sessionId } = req.body as RequestOtpInput

  const existingUser = await findUserByIdentifier(identifier)
  await requestOtp(identifier, sessionId, existingUser?.id ?? null)

  res.status(200).json(successResponse(null, MESSAGES.auth.otpSent))
}

export const verifyPatientOtp = async (req: Request, res: Response): Promise<void> => {
  const { identifier, sessionId, otp } = req.body as VerifyOtpInput

  let user = await findUserByIdentifier(identifier)
  await verifyOtp(identifier, sessionId, otp, user?.id ?? null)

  if (!user) {
    user = await createPatientUser(identifier, identifier)
  }

  const token = generateToken({ userId: user.id, role: user.role })
  res.status(200).json(successResponse({ token, user }, MESSAGES.auth.otpVerified))
}

export const getMe = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.userId
  if (!userId) {
    throw new AppError(MESSAGES.auth.unauthorized, 401, 'UNAUTHENTICATED')
  }

  const user = await findUserById(userId)
  if (!user) {
    throw new AppError(MESSAGES.auth.userNotFound, 404, 'USER_NOT_FOUND')
  }

  res.status(200).json(successResponse(user, MESSAGES.auth.meSuccess))
}
