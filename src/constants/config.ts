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
    // Rescheduling locks this many minutes ahead of the slot — too late to move
    // it without the patient already being on their way.
    rescheduleLockMinutesBeforeStart: 30,
    // How long after the slot a call can still be joined. A late start is
    // normal; a booking from yesterday should be rescheduled, not joined.
    joinGraceMinutesAfterStart: 60,
  },

  jitsi: {
    domain: process.env.NEXT_PUBLIC_JITSI_DOMAIN ?? 'meet.jit.si',
  },

  pagination: {
    defaultPageSize: 20,
    maxPageSize: 100,
  },

  support: {
    phoneNumber: '+91 74831 69750',
  },
} as const
