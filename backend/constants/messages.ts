// Every backend response message and error string. Never hardcode copy in controllers/services.

export const MESSAGES = {
  auth: {
    loginSuccess: 'Logged in successfully.',
    invalidCredentials: 'Invalid email or password.',
    otpSent: 'OTP sent successfully.',
    otpVerified: 'OTP verified successfully.',
    otpInvalid: 'Invalid OTP.',
    otpExpired: 'OTP has expired.',
    otpLocked: 'Too many failed attempts. Try again later.',
    unauthorized: 'Unauthorized. Please log in.',
    forbidden: 'You do not have permission to perform this action.',
    userNotFound: 'User not found.',
    meSuccess: 'Current user fetched successfully.',
  },

  session: {
    createSuccess: 'Session created successfully.',
    fetchSuccess: 'Session fetched successfully.',
    startSuccess: 'Session started.',
    endSuccess: 'Session ended.',
    notFound: 'Session not found.',
    joinTokenInvalid: 'Invalid or expired join link.',
    joinTokenValid: 'Join token validated.',
    shareLogged: 'Share action logged.',
  },

  appointment: {
    createSuccess: 'Appointment created successfully.',
    updateSuccess: 'Appointment updated successfully.',
    cancelSuccess: 'Appointment cancelled successfully.',
    fetchSuccess: 'Appointments fetched successfully.',
    notFound: 'Appointment not found.',
  },

  notes: {
    createSuccess: 'Notes draft saved.',
    enhanceSuccess: 'Notes enhanced successfully.',
    enhanceFailed: 'Failed to enhance notes.',
    approveSuccess: 'Notes approved successfully.',
    pdfGenerated: 'Report PDF generated successfully.',
    sendSuccess: 'Report sent to patient successfully.',
    notFound: 'Session notes not found.',
  },

  dashboard: {
    physioSuccess: 'Physio dashboard data fetched successfully.',
    patientSuccess: 'Patient dashboard data fetched successfully.',
    adminSuccess: 'Admin dashboard data fetched successfully.',
  },

  validation: {
    invalidBody: 'Request body validation failed.',
    missingField: (field: string) => `${field} is required.`,
  },

  errors: {
    internal: 'Internal server error.',
    notFound: 'Resource not found.',
    badRequest: 'Bad request.',
  },
} as const
