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
      // Nothing here is cacheable: these are one user's live records. Without
      // this the browser is free to reuse a response it decides is fresh
      // enough — the API sends an ETag but no Cache-Control, which leaves that
      // judgement to heuristics. A patient polling for their session to start
      // would be handed the same "not started yet" answer indefinitely.
      cache: 'no-store',
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
