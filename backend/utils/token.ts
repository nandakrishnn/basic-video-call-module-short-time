import jwt from 'jsonwebtoken'
import type { SignOptions } from 'jsonwebtoken'
import { CONFIG } from '../constants/config'
import type { AuthTokenPayload } from '../types/user.types'

export const generateToken = (payload: AuthTokenPayload): string => {
  const expiresIn = CONFIG.jwt.expiry as SignOptions['expiresIn']
  return jwt.sign(payload, CONFIG.jwt.secret, { expiresIn })
}

export const verifyToken = (token: string): AuthTokenPayload => {
  return jwt.verify(token, CONFIG.jwt.secret) as AuthTokenPayload
}
