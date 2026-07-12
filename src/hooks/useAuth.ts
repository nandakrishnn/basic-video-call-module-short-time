'use client'

import { useCallback, useEffect, useState } from 'react'
import { getMeRequest, loginRequest, verifyPatientOtpRequest } from '@/services/auth.service'
import type { User } from '@/types/user.types'
import { clearToken, getToken, setToken } from '@/utils/storage'

interface UseAuthResult {
  user: User | null
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<boolean>
  verifyOtp: (identifier: string, sessionId: string, otp: string) => Promise<boolean>
  logout: () => void
}

export const useAuth = (): UseAuthResult => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = getToken()
    if (!token) {
      setIsLoading(false)
      return
    }

    getMeRequest(token)
      .then((res) => {
        if (res.success) setUser(res.data)
        else clearToken()
      })
      .finally(() => setIsLoading(false))
  }, [])

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    const res = await loginRequest(email, password)
    setIsLoading(false)

    if (!res.success) {
      setError(res.message)
      return false
    }

    setToken(res.data.token)
    setUser(res.data.user)
    return true
  }, [])

  const verifyOtp = useCallback(
    async (identifier: string, sessionId: string, otp: string): Promise<boolean> => {
      setIsLoading(true)
      setError(null)
      const res = await verifyPatientOtpRequest(identifier, sessionId, otp)
      setIsLoading(false)

      if (!res.success) {
        setError(res.message)
        return false
      }

      setToken(res.data.token)
      setUser(res.data.user)
      return true
    },
    [],
  )

  const logout = useCallback((): void => {
    clearToken()
    setUser(null)
  }, [])

  return { user, isLoading, error, login, verifyOtp, logout }
}
