import { AuditAction } from '../constants/enums'
import { CONFIG } from '../constants/config'
import { MESSAGES } from '../constants/messages'
import { AppError } from '../middleware/error.middleware'
import {
  createOtpRecord,
  findActiveOtp,
  incrementOtpAttempts,
  lockOtp,
  markOtpVerified,
} from '../models/otp.model'
import { addMinutes, isPast, parseUtc } from '../utils/date'
import { compareValue, generateOtp, hashValue } from '../utils/hash'
import { logAudit } from './audit.service'
import { sendOtpEmail } from './email.service'
import { sendOtpSms } from './sms.service'

export const requestOtp = async (
  identifier: string,
  sessionId: string | null,
  userId: string | null,
): Promise<void> => {
  const otp = generateOtp()
  const otpHash = await hashValue(otp)
  const expiresAt = addMinutes(new Date(), CONFIG.otp.expiryMinutes).toISOString()

  await createOtpRecord({ identifier, otpHash, sessionId, expiresAt })

  if (identifier.includes('@')) {
    await sendOtpEmail(identifier, otp)
  } else {
    await sendOtpSms(identifier, otp)
  }

  await logAudit({
    userId,
    action: AuditAction.OTP_SENT,
    resource: sessionId ? 'session' : 'auth',
    resourceId: sessionId ?? undefined,
  })
}

export const verifyOtp = async (
  identifier: string,
  sessionId: string | null,
  otp: string,
  userId: string | null,
): Promise<void> => {
  const record = await findActiveOtp(identifier, sessionId)
  if (!record) {
    throw new AppError(MESSAGES.auth.otpInvalid, 400, 'OTP_INVALID')
  }

  if (record.locked_until && !isPast(parseUtc(record.locked_until))) {
    throw new AppError(MESSAGES.auth.otpLocked, 423, 'OTP_LOCKED')
  }

  if (isPast(parseUtc(record.expires_at))) {
    throw new AppError(MESSAGES.auth.otpExpired, 400, 'OTP_EXPIRED')
  }

  const isValid = await compareValue(otp, record.otp_hash)
  if (!isValid) {
    const attempts = record.attempts + 1
    if (attempts >= CONFIG.otp.maxAttempts) {
      await lockOtp(record.id, addMinutes(new Date(), CONFIG.otp.lockMinutes).toISOString())
      throw new AppError(MESSAGES.auth.otpLocked, 423, 'OTP_LOCKED')
    }
    await incrementOtpAttempts(record.id, attempts)
    throw new AppError(MESSAGES.auth.otpInvalid, 400, 'OTP_INVALID')
  }

  await markOtpVerified(record.id)
  await logAudit({
    userId,
    action: AuditAction.OTP_VERIFIED,
    resource: sessionId ? 'session' : 'auth',
    resourceId: sessionId ?? undefined,
  })
}
