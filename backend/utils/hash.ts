import bcrypt from 'bcrypt'
import { CONFIG } from '../constants/config'

export const hashValue = async (value: string): Promise<string> => {
  return bcrypt.hash(value, CONFIG.bcrypt.saltRounds)
}

export const compareValue = async (value: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(value, hash)
}

export const generateOtp = (): string => {
  const min = 10 ** (CONFIG.otp.length - 1)
  const max = 10 ** CONFIG.otp.length - 1
  return String(Math.floor(min + Math.random() * (max - min + 1)))
}
