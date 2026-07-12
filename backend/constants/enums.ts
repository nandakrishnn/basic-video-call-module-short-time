export enum UserRole {
  ADMIN = 'admin',
  PHYSIO = 'physio',
  PATIENT = 'patient',
}

export enum SessionStatus {
  SCHEDULED = 'scheduled',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum AppointmentType {
  INITIAL = 'initial',
  FOLLOWUP = 'followup',
  REVIEW = 'review',
  DISCHARGE = 'discharge',
}

export enum AppointmentStatus {
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum SessionParticipantRole {
  PHYSIO = 'physio',
  PATIENT = 'patient',
}

export enum ShareChannel {
  EMAIL = 'email',
}

export enum AuditAction {
  SESSION_LINK_GENERATED = 'session_link_generated',
  LINK_SHARED_EMAIL = 'link_shared_email',
  OTP_SENT = 'otp_sent',
  OTP_VERIFIED = 'otp_verified',
  PATIENT_JOINED = 'patient_joined',
  PHYSIO_JOINED = 'physio_joined',
  CALL_STARTED = 'call_started',
  CALL_ENDED = 'call_ended',
  NOTES_CREATED = 'notes_created',
  NOTES_ENHANCED = 'notes_enhanced',
  NOTES_APPROVED = 'notes_approved',
  PDF_GENERATED = 'pdf_generated',
  REPORT_SENT = 'report_sent',
  APPOINTMENT_SCHEDULED = 'appointment_scheduled',
}
