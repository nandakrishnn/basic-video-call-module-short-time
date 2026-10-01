import { Check, X } from 'lucide-react'
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { COLORS, FONT_SIZES, RADII, SHADOWS } from '@/constants/colors'

type ToastTone = 'success' | 'error'

interface ToastContextValue {
  showToast: (message: string, tone?: ToastTone) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const VISIBLE_MS = 4000

/**
 * A brief confirmation that outlives a route change.
 *
 * The provider sits above the router's page, so a toast raised just before
 * navigating is still on screen when the next page renders — which is what
 * lets an action confirm itself without parking the user on a page whose only
 * purpose is to say it worked.
 */
export const ToastProvider = ({ children }: { children: ReactNode }): JSX.Element => {
  const [toast, setToast] = useState<{ message: string; tone: ToastTone } | null>(null)
  const timer = useRef<number>()

  const dismiss = useCallback((): void => {
    window.clearTimeout(timer.current)
    setToast(null)
  }, [])

  const showToast = useCallback((message: string, tone: ToastTone = 'success'): void => {
    window.clearTimeout(timer.current)
    setToast({ message, tone })
    timer.current = window.setTimeout(() => setToast(null), VISIBLE_MS)
  }, [])

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const value = useMemo(() => ({ showToast }), [showToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast && (
        <div className="toast" role="status" aria-live="polite">
          <span
            style={{
              display: 'inline-flex',
              flexShrink: 0,
              color: toast.tone === 'error' ? COLORS.status.error : COLORS.status.success,
            }}
          >
            {toast.tone === 'error' ? <X size={17} /> : <Check size={17} />}
          </span>
          <span style={{ color: COLORS.text.primary, fontSize: FONT_SIZES.base, fontWeight: 600 }}>
            {toast.message}
          </span>
          <button type="button" onClick={dismiss} aria-label="Dismiss" className="toast-dismiss">
            <X size={15} />
          </button>
        </div>
      )}
    </ToastContext.Provider>
  )
}

/**
 * Returns a no-op outside the provider rather than throwing: a confirmation
 * failing to appear is not worth taking a page down for.
 */
export const useToast = (): ToastContextValue => useContext(ToastContext) ?? { showToast: () => undefined }
