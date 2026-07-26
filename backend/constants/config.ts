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
    joinWindowMinutesBeforeStart: 5,
  },

  jitsi: {
    domain: process.env.NEXT_PUBLIC_JITSI_DOMAIN ?? 'meet.jit.si',
  },

  jaas: {
    appId: process.env.JAAS_APP_ID ?? '',
    apiKeyId: process.env.JAAS_API_KEY_ID ?? '',
    // Render env vars store the PEM on one line; restore real newlines.
    privateKey: (process.env.JAAS_PRIVATE_KEY ?? '').replace(/\\n/g, '\n'),
  },

  bcrypt: {
    saltRounds: 10,
  },

  app: {
    url: process.env.NEXT_PUBLIC_APP_URL ?? '',
    port: Number(process.env.PORT ?? 5000),
    backendUrl: process.env.RENDER_EXTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL ?? '',
    // The server's own locale/TZ (Render defaults to UTC) has nothing to do with the
    // recipient's — every date/time shown to a user must be pinned to this explicitly.
    timezone: process.env.APP_TIMEZONE ?? 'Asia/Kolkata',
  },
} as const
