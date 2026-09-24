import { Search } from 'lucide-react'
import type { CSSProperties } from 'react'
import { Input } from '@/components/shared/Input'
import { COLORS, RADII } from '@/constants/colors'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder: string
  /** Applied to the wrapper, for flex sizing at the call site. */
  style?: CSSProperties
  pill?: boolean
}

// The left padding is set inline rather than in globals.css on purpose: Input
// applies `padding` as an inline style, which outranks any stylesheet rule, so
// a CSS-only `padding-left` was silently ignored and the icon sat on the text.
const ICON_GUTTER = 42

export const SearchInput = ({ value, onChange, placeholder, style, pill = false }: SearchInputProps): JSX.Element => (
  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', minWidth: 0, ...style }}>
    <Search
      size={17}
      color={COLORS.text.muted}
      style={{ position: 'absolute', left: 14, pointerEvents: 'none' }}
    />
    <Input
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label={placeholder}
      style={{
        paddingLeft: ICON_GUTTER,
        ...(pill ? { borderRadius: RADII.pill, background: COLORS.surface } : null),
      }}
    />
  </div>
)
