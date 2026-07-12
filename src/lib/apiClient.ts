import { MESSAGES } from '@/constants/messages'
import type { ApiResponse } from '@/types/api.types'

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: unknown
  token?: string | null
}

export const apiRequest = async <T>(url: string, options: RequestOptions = {}): Promise<ApiResponse<T>> => {
  const { method = 'GET', body, token } = options

  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`

  try {
    const res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })
    return (await res.json()) as ApiResponse<T>
  } catch {
    return {
      success: false,
      message: MESSAGES.errors.network,
      code: 'NETWORK_ERROR',
      timestamp: new Date().toISOString(),
    }
  }
}
