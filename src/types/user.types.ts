export type UserRole = 'admin' | 'physio' | 'patient'

export interface User {
  id: string
  email: string | null
  phone: string | null
  fullName: string
  role: UserRole
  dateOfBirth: string | null
  specialization: string | null
  /** Presenting complaint, e.g. "Neck pain". Patients only. */
  issue: string | null
}

/**
 * The subset needed to render a person in a list or row. Satisfied by both User
 * and the leaner RecentPatient the dashboard endpoint returns, so components
 * that only display someone can accept either.
 */
export interface PatientSummary {
  fullName: string
  email: string | null
  phone: string | null
  issue?: string | null
}
