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
    readyTitle: 'Ready to join',
    deviceChecking: 'Checking your camera and microphone…',
    deviceReady: 'Your devices are working properly',
    deviceError: "Couldn't access camera or microphone. You can still join.",
    joinButton: 'Join call',
    callEndedTitle: 'Thank you',
    callEndedPatientBody: 'Your session notes will be mailed to you shortly — kindly check your email for the update.',
    callEndedPatientLoginBody: 'You can log in to your account anytime to view your past calls and reports.',
    viewDashboardButton: 'Go to your dashboard',
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
    scheduleButton: 'Schedule Appointment',
    shareEmailButton: 'Share via Gmail',
  },

  dashboard: {
    emptyToday: 'No sessions scheduled for today.',
    emptyUpcoming: 'No upcoming appointments.',
    emptyPatients: 'No patients yet.',
    emptyPastCalls: 'No past calls yet.',
  },

  newCall: {
    button: 'New Call',
    selectPatient: 'Select patient',
    addPatientButton: '+ Add patient',
    addPatientTitle: 'Add a new patient',
    startCallButton: 'Start Call',
    createPatientFailed: 'Could not add patient. Please try again.',
    missingContact: 'Enter both an email and phone number.',
    whenNow: 'Start now',
    whenLater: 'Schedule for later',
    missingSchedule: 'Pick a date and time.',
    scheduleCallButton: 'Schedule Call',
    scheduleSuccess: "Call scheduled — it'll show up in your upcoming appointments.",
    doneButton: 'Done',
  },

  errors: {
    generic: 'Something went wrong. Please try again.',
    network: 'Network error. Check your connection and try again.',
    unauthorized: 'You are not authorized to view this.',
  },

  brand: {
    clinzorEyebrow: 'The platform',
    clinzorBody: 'Clinical-grade technology — AI, pose detection, video calls, session management — built for physiotherapy professionals.',
    yorphysioEyebrow: 'The service',
    yorphysioBody: 'The consumer-facing brand — booking, physio matching, home visits, and video consultations — powered by the Clinzor platform.',
    contactLink: 'Contact us',
  },

  contact: {
    title: 'Contact us',
    body: "Clinzor is the platform powering YorPhysio's physiotherapy sessions. Reach either team from the links below.",
  },

  patientLogin: {
    title: 'Sign in',
    body: 'Enter the email or phone number on file with your physio to get a one-time code.',
    physioLinkBody: 'Are you a physio or admin?',
    physioLinkLabel: 'Sign in here',
  },

  login: {
    patientLinkBody: 'Are you a patient?',
    patientLinkLabel: 'Sign in here',
  },

  nav: {
    logout: 'Log out',
    roleAdmin: 'Administrator',
    rolePhysio: 'Physiotherapist',
    rolePatient: 'Patient',
  },
} as const
