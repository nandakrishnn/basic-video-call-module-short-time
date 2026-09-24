import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { COLORS, FONT_SIZES, RADII, SHADOWS } from '@/constants/colors'

interface DatePickerProps {
  /** ISO calendar date, "YYYY-MM-DD" — the same shape a native date input emits. */
  value: string
  onChange: (value: string) => void
  placeholder?: string
  /** Earliest selectable day, also "YYYY-MM-DD". */
  min?: string
  ariaLabel?: string
}

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const POPOVER_WIDTH = 288
const POPOVER_HEIGHT = 330

const pad = (n: number): string => String(n).padStart(2, '0')

/** Local-time key, never toISOString — that shifts the day in any non-UTC zone. */
const toKey = (date: Date): string => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

const fromKey = (key: string): Date | null => {
  const [y, m, d] = key.split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}

/** Six weeks of days covering `month`, padded from the surrounding months. */
const buildGrid = (month: Date): Date[] => {
  const first = new Date(month.getFullYear(), month.getMonth(), 1)
  const start = new Date(first)
  start.setDate(first.getDate() - first.getDay())
  return Array.from({ length: 42 }, (_, i) => {
    const day = new Date(start)
    day.setDate(start.getDate() + i)
    return day
  })
}

export const DatePicker = ({ value, onChange, placeholder = 'Pick a date', min, ariaLabel }: DatePickerProps) => {
  const selected = value ? fromKey(value) : null
  const [isOpen, setIsOpen] = useState(false)
  const [month, setMonth] = useState(() => selected ?? new Date())
  const [coords, setCoords] = useState({ top: 0, left: 0 })
  const triggerRef = useRef<HTMLButtonElement>(null)

  // Reopening should land on the selected month, not wherever it was left.
  useEffect(() => {
    if (isOpen) setMonth(selected ?? new Date())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  // Positioned fixed against the trigger's rect so the popover escapes the
  // overflow containers it sits inside — modal bodies and the table toolbar
  // both clip an absolutely positioned child.
  useLayoutEffect(() => {
    if (!isOpen || !triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    const openUp = rect.bottom + POPOVER_HEIGHT > window.innerHeight && rect.top > POPOVER_HEIGHT
    setCoords({
      top: openUp ? rect.top - POPOVER_HEIGHT - 8 : rect.bottom + 8,
      left: Math.min(Math.max(8, rect.left), Math.max(8, window.innerWidth - POPOVER_WIDTH - 8)),
    })
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    // Scrolling would leave the popover stranded from its trigger.
    const close = (): void => setIsOpen(false)
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('resize', close)
    window.addEventListener('scroll', close, true)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('resize', close)
      window.removeEventListener('scroll', close, true)
    }
  }, [isOpen])

  const todayKey = toKey(new Date())
  const minDate = min ? fromKey(min) : null
  const shiftMonth = (delta: number): void =>
    setMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1))

  const navButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 30,
    height: 30,
    border: 'none',
    borderRadius: RADII.sm,
    background: COLORS.surfaceAlt,
    color: COLORS.text.secondary,
    cursor: 'pointer',
    padding: 0,
  }

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
        <CalendarDays size={16} color={COLORS.text.secondary} />
        <span style={{ color: selected ? COLORS.text.primary : COLORS.text.muted }}>
          {selected
            ? selected.toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
            : placeholder}
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
              padding: 14,
              borderRadius: RADII.lg,
              border: `1px solid ${COLORS.border}`,
              background: COLORS.surface,
              boxShadow: SHADOWS.lg,
              zIndex: 401,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 12,
              }}
            >
              <button type="button" onClick={() => shiftMonth(-1)} aria-label="Previous month" style={navButtonStyle}>
                <ChevronLeft size={16} />
              </button>
              <span style={{ color: COLORS.text.primary, fontSize: FONT_SIZES.base, fontWeight: 700 }}>
                {month.toLocaleDateString([], { month: 'long', year: 'numeric' })}
              </span>
              <button type="button" onClick={() => shiftMonth(1)} aria-label="Next month" style={navButtonStyle}>
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="date-grid" aria-hidden="true">
              {WEEKDAYS.map((day, i) => (
                <span key={`${day}-${i}`} className="date-weekday">
                  {day}
                </span>
              ))}
            </div>

            <div className="date-grid">
              {buildGrid(month).map((day) => {
                const key = toKey(day)
                const isOtherMonth = day.getMonth() !== month.getMonth()
                const isDisabled = minDate ? day < minDate : false
                const isSelected = key === value
                const isToday = key === todayKey

                return (
                  <button
                    key={key}
                    type="button"
                    disabled={isDisabled}
                    aria-current={isToday ? 'date' : undefined}
                    onClick={() => {
                      onChange(key)
                      setIsOpen(false)
                    }}
                    className={`date-cell${isSelected ? ' selected' : ''}${isToday ? ' today' : ''}`}
                    style={{ opacity: isOtherMonth && !isSelected ? 0.35 : 1 }}
                  >
                    {day.getDate()}
                  </button>
                )
              })}
            </div>

            <button
              type="button"
              onClick={() => {
                onChange(todayKey)
                setIsOpen(false)
              }}
              className="date-today-button"
            >
              Today
            </button>
          </div>
        </>
      )}
    </>
  )
}
