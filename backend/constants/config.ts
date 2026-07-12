export const CONFIG = {
  otp: {
    length: 4,
    expiryMinutes: Number(process.env.OTP_EXPIRY_MINUTES ?? 10),
    maxAttempts: Number(process.env.OTP_MAX_ATTEMPTS ?? 3),
    lockMinutes: Number(process.env.OTP_LOCK_MINUTES ?? 30),
  },

  jwt: {
    secret: process.env.JWT_SECRET ?? '',
    expiry: process.env.JWT_EXPIRY ?? '7d',
  },

  session: {
    defaultDurationMinutes: 30,
    joinWindowMinutesBeforeStart: 10,
  },

  jitsi: {
    domain: process.env.NEXT_PUBLIC_JITSI_DOMAIN ?? 'meet.jit.si',
  },

  bcrypt: {
    saltRounds: 10,
  },

  app: {
    url: process.env.NEXT_PUBLIC_APP_URL ?? '',
    port: Number(process.env.PORT ?? 5000),
  },
} as const
