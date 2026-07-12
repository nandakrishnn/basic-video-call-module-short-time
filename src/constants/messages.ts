// Every user-facing string and error message. Never hardcode copy elsewhere.

export const MESSAGES = {
  auth: {
    otpSentTitle: 'OTP sent',
    otpSentBody: 'Enter the 4-digit code we sent to verify your identity.',
    otpInvalid: 'That code is incorrect. Please try again.',
    otpExpired: 'This code has expired. Request a new one.',
    otpLocked: 'Too many attempts. Try again in 30 minutes.',
    loginFailed: 'Invalid email or password.',
    sessionExpired: 'Your session has expired. Please log in again.',
  },

  session: {
    joinChoiceTitle: 'Join your session',
    joinChoiceBody: 'Log in to your Clinzor account, or continue as a guest with a one-time code.',
    loginOption: 'Log in to your account',
    guestOption: 'Join as guest with OTP',
    connecting: 'Connecting to your session…',
    ended: 'This session has ended.',
    notYetActive: 'This session is not active yet.',
    poweredBy: 'Powered by Clinzor',
  },

  notes: {
    rawPlaceholder: "Write your session notes freely, don't worry about grammar or structure...",
    enhancing: 'Enhancing your notes with AI…',
    enhanceFailed: 'Could not enhance notes. Please try again.',
    draftSaved: 'Draft saved',
    approved: 'Notes approved and saved.',
    sendSuccess: 'Report sent to patient.',
    sendFailed: 'Could not send report. Please try again.',
  },

  appointments: {
    createSuccess: 'Appointment scheduled.',
    createFailed: 'Could not schedule appointment. Please try again.',
    cancelSuccess: 'Appointment cancelled.',
    emptyList: 'No appointments to show yet.',
  },

  dashboard: {
    emptyToday: 'No sessions scheduled for today.',
    emptyUpcoming: 'No upcoming appointments.',
    emptyPatients: 'No patients yet.',
    emptyReports: 'No reports available yet.',
  },

  errors: {
    generic: 'Something went wrong. Please try again.',
    network: 'Network error. Check your connection and try again.',
    unauthorized: 'You are not authorized to view this.',
  },
} as const
