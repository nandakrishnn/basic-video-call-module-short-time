export type UserRole = 'admin' | 'physio' | 'patient'

export interface User {
  id: string
  email: string | null
  phone: string | null
  fullName: string
  role: UserRole
  dateOfBirth: string | null
  specialization: string | null
}
