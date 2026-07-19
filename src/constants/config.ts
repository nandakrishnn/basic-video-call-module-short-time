// All non-secret config values (timeouts, limits, expiries). Never hardcode these elsewhere.

export const CONFIG = {
  otp: {
    length: 4,
    expiryMinutes: 10,
    maxAttempts: 3,
    lockMinutes: 30,
  },

  session: {
    defaultDurationMinutes: 30,
    joinWindowMinutesBeforeStart: 5,
    autoSaveDraftIntervalSeconds: 30,
  },

  jitsi: {
    domain: process.env.NEXT_PUBLIC_JITSI_DOMAIN ?? 'meet.jit.si',
  },

  pagination: {
    defaultPageSize: 20,
    maxPageSize: 100,
  },
} as const
