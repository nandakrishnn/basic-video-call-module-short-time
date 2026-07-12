import jwt from 'jsonwebtoken'
import { CONFIG } from '../constants/config'
import type { AuthTokenPayload } from '../types/user.types'

export const generateToken = (payload: AuthTokenPayload): string => {
  return jwt.sign(payload, CONFIG.jwt.secret, { expiresIn: CONFIG.jwt.expiry })
}

export const verifyToken = (token: string): AuthTokenPayload => {
  return jwt.verify(token, CONFIG.jwt.secret) as AuthTokenPayload
}
