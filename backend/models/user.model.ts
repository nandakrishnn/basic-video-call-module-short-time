import { db } from '../db'
import type { User } from '../types/user.types'

interface UserRow {
  id: string
  email: string | null
  phone: string | null
  full_name: string
  role: string
  password_hash: string | null
  date_of_birth: string | null
  specialization: string | null
  created_at: string
  updated_at: string
}

const mapRow = (row: UserRow): User => ({
  id: row.id,
  email: row.email,
  phone: row.phone,
  fullName: row.full_name,
  role: row.role as User['role'],
  passwordHash: row.password_hash,
  dateOfBirth: row.date_of_birth,
  specialization: row.specialization,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
})

export const findUserByEmail = async (email: string): Promise<User | null> => {
  const { data, error } = await db.from('users').select('*').eq('email', email).maybeSingle()
  if (error || !data) return null
  return mapRow(data as UserRow)
}

export const findUserByIdentifier = async (identifier: string): Promise<User | null> => {
  const column = identifier.includes('@') ? 'email' : 'phone'
  const { data, error } = await db.from('users').select('*').eq(column, identifier).maybeSingle()
  if (error || !data) return null
  return mapRow(data as UserRow)
}

export const findUserById = async (id: string): Promise<User | null> => {
  const { data, error } = await db.from('users').select('*').eq('id', id).maybeSingle()
  if (error || !data) return null
  return mapRow(data as UserRow)
}

export const findUsersByRole = async (role: string): Promise<User[]> => {
  const { data, error } = await db.from('users').select('*').eq('role', role)
  if (error || !data) return []
  return (data as UserRow[]).map(mapRow)
}

export const createPatientUser = async (identifier: string, fullName: string): Promise<User> => {
  const isEmail = identifier.includes('@')
  const { data, error } = await db
    .from('users')
    .insert({
      email: isEmail ? identifier : null,
      phone: isEmail ? null : identifier,
      full_name: fullName,
      role: 'patient',
    })
    .select('*')
    .single()

  if (error || !data) throw new Error('Failed to create patient user')
  return mapRow(data as UserRow)
}
