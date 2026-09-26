import { Clock } from 'lucide-react'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { COLORS, RADII, SHADOWS } from '@/constants/colors'

interface TimePickerProps {
  /** 24-hour "HH:MM", the same shape a native time input emits. */
  value: string
  onChange: (value: string) => void
  placeholder?: string
  ariaLabel?: string
}

const POPOVER_HEIGHT = 268
const POPOVER_WIDTH = 236

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1)
const MINUTES = Array.from({ length: 60 }, (_, i) => i)
const PERIODS = ['AM', 'PM'] as const

const pad = (n: number): string => String(n).padStart(2, '0')

/** "14:30" → { hour: 2, minute: 30, period: 'PM' } */
const parse = (value: string): { hour: number; minute: number; period: 'AM' | 'PM' } | null => {
  const [h, m] = value.split(':').map(Number)
  if (h === undefined || m === undefined || Number.isNaN(h) || Number.isNaN(m)) return null
  return { hour: h % 12 === 0 ? 12 : h % 12, minute: m, period: h < 12 ? 'AM' : 'PM' }
}

/** 12-hour parts → the 24-hour string consumers expect. */
const toValue = (hour: number, minute: number, period: 'AM' | 'PM'): string => {
  const h24 = period === 'AM' ? (hour === 12 ? 0 : hour) : hour === 12 ? 12 : hour + 12
  return `${pad(h24)}:${pad(minute)}`
}

export const TimePicker = ({ value, onChange, placeholder = 'Pick a time', ariaLabel }: TimePickerProps) => {
  const parts = parse(value)
  const [isOpen, setIsOpen] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0 })
  const triggerRef = useRef<HTMLButtonElement>(null)
  const columnsRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (!isOpen || !triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    const openUp = rect.bottom + POPOVER_HEIGHT > window.innerHeight && rect.top > POPOVER_HEIGHT
    setCoords({
      top: openUp ? rect.top - POPOVER_HEIGHT - 8 : rect.bottom + 8,
      left: Math.min(Math.max(8, rect.left), Math.max(8, window.innerWidth - POPOVER_WIDTH - 8)),
    })
  }, [isOpen])

  // Bring the current selection into view — otherwise a 60-row minute column
  // opens at midnight regardless of what is selected.
  useEffect(() => {
    if (!isOpen || !columnsRef.current) return
    for (const selected of Array.from(columnsRef.current.querySelectorAll('[data-selected="true"]'))) {
      selected.scrollIntoView({ block: 'center' })
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    const close = (): void => setIsOpen(false)
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('resize', close)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('resize', close)
    }
  }, [isOpen])

  const commit = (next: Partial<{ hour: number; minute: number; period: 'AM' | 'PM' }>): void => {
    const base = parts ?? { hour: 9, minute: 0, period: 'AM' as const }
    onChange(toValue(next.hour ?? base.hour, next.minute ?? base.minute, next.period ?? base.period))
  }

  const cell = (label: string, selected: boolean, onClick: () => void) => (
    <button
      key={label}
      type="button"
      data-selected={selected}
      onClick={onClick}
      className={`time-cell${selected ? ' selected' : ''}`}
    >
      {label}
    </button>
  )

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={ariaLabel ?? placeholder}
        aria-expanded={isOpen}
        className="date-trigger"
        style={{ borderColor: isOpen ? COLORS.primaryStrong : COLORS.border }}
      >
        <Clock size={16} color={COLORS.text.secondary} />
        <span style={{ color: parts ? COLORS.text.primary : COLORS.text.muted }}>
          {parts ? `${parts.hour}:${pad(parts.minute)} ${parts.period}` : placeholder}
        </span>
      </button>

      {isOpen && (
        <>
          <div onClick={() => setIsOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 400 }} />
          <div
            role="dialog"
            aria-label={ariaLabel ?? placeholder}
            style={{
              position: 'fixed',
              top: coords.top,
              left: coords.left,
              width: POPOVER_WIDTH,
              height: POPOVER_HEIGHT,
              padding: 10,
              borderRadius: RADII.lg,
              border: `1px solid ${COLORS.border}`,
              background: COLORS.surface,
              boxShadow: SHADOWS.lg,
              zIndex: 401,
            }}
          >
            <div
              ref={columnsRef}
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, height: '100%' }}
            >
              <div className="time-column">
                {HOURS.map((h) => cell(String(h), parts?.hour === h, () => commit({ hour: h })))}
              </div>
              <div className="time-column">
                {MINUTES.map((m) => cell(pad(m), parts?.minute === m, () => commit({ minute: m })))}
              </div>
              <div className="time-column">
                {PERIODS.map((p) => cell(p, parts?.period === p, () => commit({ period: p })))}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
