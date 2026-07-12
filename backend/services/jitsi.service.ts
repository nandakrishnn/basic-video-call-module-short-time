import { createHash } from 'crypto'
import { CONFIG } from '../constants/config'

const hashId = (id: string): string => {
  return createHash('sha256').update(id).digest('hex').slice(0, 6)
}

export const generateRoomName = (physioId: string, patientId: string): string => {
  const physioHash = hashId(physioId)
  const patientHash = hashId(patientId)
  const timestamp = Math.floor(Date.now() / 1000)
  return `clinzor-${physioHash}-${patientHash}-${timestamp}`
}

export const generateRoomLink = (roomName: string): string => {
  return `https://${CONFIG.jitsi.domain}/${roomName}`
}
