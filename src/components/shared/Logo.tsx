import Image from 'next/image'

interface LogoProps {
  surface: 'light' | 'dark'
  size?: 'sm' | 'md' | 'lg'
}

// Aspect ratios come from the source PNGs — never stretch either logo off its native ratio.
const ASSETS = {
  light: { src: '/logo-blue.png', ratio: 335 / 139 },
  dark: { src: '/logo-white.png', ratio: 922 / 390 },
} as const

const HEIGHTS = {
  sm: 20,
  md: 28,
  lg: 40,
} as const

export const Logo = ({ surface, size = 'md' }: LogoProps): JSX.Element => {
  const asset = ASSETS[surface]
  const height = HEIGHTS[size]
  const width = Math.round(height * asset.ratio)

  return (
    <Image
      src={asset.src}
      alt="Clinzor"
      width={width}
      height={height}
      priority
      style={{ height, width: 'auto', objectFit: 'contain' }}
    />
  )
}
