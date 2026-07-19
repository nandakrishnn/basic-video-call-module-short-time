import { db } from '../db'

export interface OtpRow {
  id: string
  identifier: string
  otp_hash: string
  session_id: string | null
  attempts: number
  expires_at: string
  verified_at: string | null
  locked_until: string | null
  created_at: string
}

export const createOtpRecord = async (params: {
  identifier: string
  otpHash: string
  sessionId: string | null
  expiresAt: string
}): Promise<void> => {
  const { error } = await db.from('otp_store').insert({
    identifier: params.identifier,
    otp_hash: params.otpHash,
    session_id: params.sessionId,
    expires_at: params.expiresAt,
  })
  if (error) throw new Error('Failed to create OTP record')
}

export const findActiveOtp = async (identifier: string, sessionId: string | null): Promise<OtpRow | null> => {
  let query = db.from('otp_store').select('*').eq('identifier', identifier).is('verified_at', null)
  query = sessionId === null ? query.is('session_id', null) : query.eq('session_id', sessionId)

  const { data, error } = await query.order('created_at', { ascending: false }).limit(1).maybeSingle()

  if (error || !data) return null
  return data as OtpRow
}

export const incrementOtpAttempts = async (id: string, attempts: number): Promise<void> => {
  await db.from('otp_store').update({ attempts }).eq('id', id)
}

export const lockOtp = async (id: string, lockedUntil: string): Promise<void> => {
  await db.from('otp_store').update({ locked_until: lockedUntil }).eq('id', id)
}

export const markOtpVerified = async (id: string): Promise<void> => {
  await db.from('otp_store').update({ verified_at: new Date().toISOString() }).eq('id', id)
}
