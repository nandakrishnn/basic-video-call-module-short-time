import Image from 'next/image'
import { useState } from 'react'
import { COLORS, RADII } from '@/constants/colors'

interface LogoProps {
  /** Which surface the logo sits on — picks the mark that stays legible there. */
  surface: 'light' | 'dark'
  size?: 'sm' | 'md' | 'lg'
  /** Show the "YORPHYSIO" wordmark beside the mark, as in the session screens. */
  showWordmark?: boolean
}

// Aspect ratio comes from the source artwork — never stretch the mark off it.
const ASSETS = {
  light: { src: '/yorphysio-logo.png', ratio: 1304 / 1198 },
  dark: { src: '/yorphysio-logo-white.png', ratio: 1304 / 1198 },
} as const

// Shipped with the repo, so the header never renders broken while the primary
// artwork above is being added. Drop the two files into public/ and this stops
// being reached — no code change needed.
const FALLBACK = { src: '/yorphysio-mark.webp', ratio: 1 } as const

const HEIGHTS = {
  sm: 22,
  md: 30,
  lg: 42,
} as const

const WORDMARK_SIZE = {
  sm: '0.72rem',
  md: '0.9rem',
  lg: '1.15rem',
} as const

export const Logo = ({ surface, size = 'md', showWordmark = false }: LogoProps): JSX.Element => {
  const [failed, setFailed] = useState(false)

  const asset = failed ? FALLBACK : ASSETS[surface]
  const height = HEIGHTS[size]
  const width = Math.round(height * asset.ratio)

  const mark = (
    <Image
      key={asset.src}
      src={asset.src}
      alt="YorPhysio"
      width={width}
      height={height}
      priority
      onError={() => setFailed(true)}
      style={{ height, width: 'auto', objectFit: 'contain', borderRadius: RADII.sm }}
    />
  )

  if (!showWordmark) return mark

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      {mark}
      <span
        className="logo-wordmark"
        style={{
          color: surface === 'dark' ? COLORS.text.inverse : COLORS.accent,
          fontSize: WORDMARK_SIZE[size],
          fontWeight: 700,
          letterSpacing: '0.18em',
          whiteSpace: 'nowrap',
        }}
      >
        YORPHYSIO
      </span>
    </span>
  )
}
