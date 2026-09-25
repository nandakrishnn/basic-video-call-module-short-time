import { Check, ChevronDown } from 'lucide-react'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { COLORS, FONT_SIZES, RADII, SHADOWS } from '@/constants/colors'

export interface SelectMenuOption<T extends string> {
  value: T
  label: string
  /** Shown trailing the label, e.g. how many rows match. */
  count?: number
}

interface SelectMenuProps<T extends string> {
  value: T
  options: SelectMenuOption<T>[]
  onChange: (value: T) => void
  ariaLabel: string
  minWidth?: number
}

const MENU_MAX_HEIGHT = 300

/**
 * A themed replacement for <select>. The native option list is drawn by the OS,
 * so it keeps the system font and highlight colour whatever the page does —
 * this renders the list ourselves so it matches everything around it.
 *
 * Positioned fixed against the trigger's rect, so it escapes the overflow
 * containers it sits inside rather than being clipped by them.
 */
export const SelectMenu = <T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
  minWidth = 176,
}: SelectMenuProps<T>): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0, width: minWidth })
  const triggerRef = useRef<HTMLButtonElement>(null)

  const selected = options.find((option) => option.value === value)

  useLayoutEffect(() => {
    if (!isOpen || !triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    const openUp = rect.bottom + MENU_MAX_HEIGHT > window.innerHeight && rect.top > MENU_MAX_HEIGHT
    setCoords({
      top: openUp ? rect.top - 6 : rect.bottom + 6,
      left: Math.min(rect.left, Math.max(8, window.innerWidth - rect.width - 8)),
      width: rect.width,
    })
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    // Scrolling would strand the menu away from its trigger.
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

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="select-trigger"
        style={{ minWidth, borderColor: isOpen ? COLORS.primaryStrong : COLORS.border }}
      >
        <span style={{ flex: 1, textAlign: 'left' }}>
          {selected?.label ?? ''}
          {selected?.count !== undefined && (
            <span style={{ color: COLORS.text.muted, fontWeight: 600 }}> ({selected.count})</span>
          )}
        </span>
        <ChevronDown
          size={16}
          color={COLORS.text.secondary}
          style={{ flexShrink: 0, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 160ms ease' }}
        />
      </button>

      {isOpen && (
        <>
          <div onClick={() => setIsOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 400 }} />
          <div
            role="listbox"
            aria-label={ariaLabel}
            style={{
              position: 'fixed',
              top: coords.top,
              left: coords.left,
              minWidth: coords.width,
              maxHeight: MENU_MAX_HEIGHT,
              overflowY: 'auto',
              padding: 6,
              borderRadius: RADII.md,
              border: `1px solid ${COLORS.border}`,
              background: COLORS.surface,
              boxShadow: SHADOWS.lg,
              zIndex: 401,
            }}
          >
            {options.map((option) => {
              const isSelected = option.value === value
              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(option.value)
                    setIsOpen(false)
                  }}
                  className={`select-option${isSelected ? ' selected' : ''}`}
                >
                  <span style={{ flex: 1, textAlign: 'left' }}>{option.label}</span>
                  {option.count !== undefined && (
                    <span
                      style={{
                        color: isSelected ? COLORS.primaryStrong : COLORS.text.muted,
                        fontSize: FONT_SIZES.sm,
                        fontWeight: 700,
                      }}
                    >
                      {option.count}
                    </span>
                  )}
                  <Check
                    size={15}
                    style={{ flexShrink: 0, opacity: isSelected ? 1 : 0 }}
                    color={COLORS.primaryStrong}
                  />
                </button>
              )
            })}
          </div>
        </>
      )}
    </>
  )
}
