import type { CSSProperties } from 'react'
import { RADII } from '@/constants/colors'

interface SkeletonProps {
  width?: number | string
  height?: number | string
  radius?: 'sm' | 'md' | 'lg' | 'pill'
  style?: CSSProperties
}

/**
 * A single shimmering placeholder block. Compose these into a shape that
 * matches the real content, so the page doesn't reflow when data lands.
 */
export const Skeleton = ({ width = '100%', height = 14, radius = 'sm', style }: SkeletonProps): JSX.Element => (
  <span className="skeleton" style={{ width, height, borderRadius: RADII[radius], ...style }} />
)

/** Circular variant, for avatars. */
export const SkeletonCircle = ({ size = 38 }: { size?: number }): JSX.Element => (
  <span className="skeleton" style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0 }} />
)
