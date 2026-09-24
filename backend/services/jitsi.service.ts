import { createHash } from 'crypto'
import jwt from 'jsonwebtoken'
import { CONFIG } from '../constants/config'

const hashId = (id: string): string => {
  return createHash('sha256').update(id).digest('hex').slice(0, 6)
}

export const isJaasConfigured = (): boolean =>
  Boolean(CONFIG.jaas.appId && CONFIG.jaas.apiKeyId && CONFIG.jaas.privateKey)

export const generateRoomName = (physioId: string, patientId: string): string => {
  const physioHash = hashId(physioId)
  const patientHash = hashId(patientId)
  const timestamp = Math.floor(Date.now() / 1000)
  return `clinzor-${physioHash}-${patientHash}-${timestamp}`
}

// JaaS rooms are namespaced under the tenant's AppID (8x8.vc/<appId>/<room>).
// Falls back to the plain room name on the public demo server when JaaS isn't configured.
export const getJitsiRoomPath = (roomName: string): string =>
  isJaasConfigured() ? `${CONFIG.jaas.appId}/${roomName}` : roomName

export const generateRoomLink = (roomName: string): string => {
  const domain = isJaasConfigured() ? '8x8.vc' : CONFIG.jitsi.domain
  return `https://${domain}/${getJitsiRoomPath(roomName)}`
}

interface JitsiTokenParams {
  roomName: string
  userId: string
  name: string
  email: string | null
  moderator: boolean
}

// JaaS rejects a token whose payload has no `context.features` with
// "Authentication failed … The `features` object is missing from the payload",
// so it must always be present even when every capability is off. Values are
// strings to match `context.user.moderator` below; Jitsi accepts 'true'/true
// interchangeably when reading them.
const JAAS_FEATURES = {
  livestreaming: 'false',
  recording: 'false',
  transcription: 'false',
  'outbound-call': 'false',
  'sip-outbound-call': 'false',
} as const

// Only meaningful when JaaS is configured — the public demo server needs no token.
export const generateJitsiToken = (params: JitsiTokenParams): string | null => {
  if (!isJaasConfigured()) return null

  const now = Math.floor(Date.now() / 1000)
  const payload = {
    aud: 'jitsi',
    iss: 'chat',
    sub: CONFIG.jaas.appId,
    // Wildcard rather than the bare room name — the frontend actually joins
    // the tenant-prefixed path (`${appId}/${roomName}`), and a mismatched
    // `room` claim gets the token silently rejected as unauthenticated.
    room: '*',
    nbf: now - 10,
    exp: now + 2 * 60 * 60,
    context: {
      features: JAAS_FEATURES,
      user: {
        // JaaS expects a stable per-participant id alongside the display
        // fields; without it participants can collide in its reporting.
        id: params.userId,
        name: params.name,
        email: params.email ?? undefined,
        avatar: '',
        // JaaS's validator expects these as strings, not booleans — a real
        // boolean can get silently ignored, leaving the user unauthenticated.
        moderator: params.moderator ? 'true' : 'false',
        'hidden-from-recorder': 'false',
      },
    },
  }

  return jwt.sign(payload, CONFIG.jaas.privateKey, {
    algorithm: 'RS256',
    header: { alg: 'RS256', kid: CONFIG.jaas.apiKeyId },
  })
}
