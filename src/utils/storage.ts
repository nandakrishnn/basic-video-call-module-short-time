const TOKEN_KEY = 'clinzor_token'

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(TOKEN_KEY)
}

export const setToken = (token: string): void => {
  window.localStorage.setItem(TOKEN_KEY, token)
}

export const clearToken = (): void => {
  window.localStorage.removeItem(TOKEN_KEY)
}

const quickNoteKey = (sessionId: string): string => `clinzor_quick_note_${sessionId}`

export const getQuickNote = (sessionId: string): string => {
  if (typeof window === 'undefined') return ''
  return window.sessionStorage.getItem(quickNoteKey(sessionId)) ?? ''
}

export const setQuickNote = (sessionId: string, value: string): void => {
  window.sessionStorage.setItem(quickNoteKey(sessionId), value)
}

export const clearQuickNote = (sessionId: string): void => {
  window.sessionStorage.removeItem(quickNoteKey(sessionId))
}
