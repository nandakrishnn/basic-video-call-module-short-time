// YorPhysio theme — every value below is a reference to a CSS custom property
// declared in src/styles/globals.css. That file is the single source of truth;
// this one exists so inline styles can reach the same tokens without the two
// ever drifting apart. Never hardcode a hex, rgb() or named color anywhere.

export const COLORS = {
  // True brand terracotta. Graphics only — chart bars, decorative fills. At
  // 3.33:1 on white it clears the 3:1 non-text bar but fails AA for text.
  primary: 'var(--color-primary)',
  // Same hue, darkened to 4.56:1 on white. Use for anything that IS text or
  // CARRIES text: buttons, links, active indicators, small icons on tints.
  primaryStrong: 'var(--color-primary-strong)',
  primaryDark: 'var(--color-primary-hover)', // hover / pressed
  primaryLight: 'var(--color-primary-strong)', // legacy alias — resolves to the accessible variant
  primarySoft: 'var(--color-primary-soft)', // tinted fill behind icons and active pills
  primarySofter: 'var(--color-primary-softer)', // faintest wash, large tinted areas
  secondary: 'var(--color-accent)', // deep brown — headings on light, dark panels
  accent: 'var(--color-accent)',

  background: 'var(--color-bg)', // warm page canvas
  surface: 'var(--color-surface)', // card background
  surfaceAlt: 'var(--color-surface-alt)', // row hover, inset fills
  border: 'var(--color-border)',
  borderStrong: 'var(--color-border-strong)',

  text: {
    primary: 'var(--color-text)',
    secondary: 'var(--color-text-secondary)',
    muted: 'var(--color-text-muted)',
    inverse: 'var(--color-text-inverse)',
  },

  status: {
    success: 'var(--color-success)',
    error: 'var(--color-error)',
    warning: 'var(--color-warning)',
    info: 'var(--color-info)',
  },

  // Tinted badge/chip backgrounds. These exist because a CSS variable cannot be
  // string-concatenated with an alpha suffix the way a raw hex could.
  statusSoft: {
    success: 'var(--color-success-soft)',
    error: 'var(--color-error-soft)',
    warning: 'var(--color-warning-soft)',
    info: 'var(--color-info-soft)',
  },

  video: {
    overlay: 'var(--color-overlay)',
    controls: 'var(--color-accent)',
    controlsText: 'var(--color-text-inverse)',
    clinzorBadge: 'var(--color-primary)',
  },

  // For content sitting on the dark overlay (video chrome, brand panels).
  onDark: {
    strong: 'var(--color-on-dark-strong)',
    muted: 'var(--color-on-dark-muted)',
    fill: 'var(--color-on-dark-fill)',
    border: 'var(--color-on-dark-border)',
  },

  glass: {
    light: 'var(--color-glass-light)',
    dark: 'var(--color-glass-dark)',
  },

  avatarPalette: [
    'var(--color-avatar-1)',
    'var(--color-avatar-2)',
    'var(--color-avatar-3)',
    'var(--color-avatar-4)',
    'var(--color-avatar-5)',
  ],
} as const

// Actual font-family is applied once at the app root via src/lib/font.ts (next/font Inter) —
// this token exists only for the rare inline reference that can't inherit it.
export const FONTS = {
  heading: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
} as const

export const RADII = {
  sm: 'var(--radius-sm)',
  md: 'var(--radius-md)',
  lg: 'var(--radius-lg)',
  xl: 'var(--radius-xl)',
  pill: 'var(--radius-pill)',
} as const

export const SHADOWS = {
  sm: 'var(--shadow-sm)',
  md: 'var(--shadow-md)',
  lg: 'var(--shadow-lg)',
} as const

export const SPACING = {
  1: 'var(--space-1)',
  2: 'var(--space-2)',
  3: 'var(--space-3)',
  4: 'var(--space-4)',
  5: 'var(--space-5)',
  6: 'var(--space-6)',
  8: 'var(--space-8)',
  10: 'var(--space-10)',
} as const

export const FONT_SIZES = {
  xs: 'var(--text-xs)',
  sm: 'var(--text-sm)',
  base: 'var(--text-base)',
  md: 'var(--text-md)',
  lg: 'var(--text-lg)',
  xl: 'var(--text-xl)',
  '2xl': 'var(--text-2xl)',
} as const
