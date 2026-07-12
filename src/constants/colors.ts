// Clinzor brand palette — sourced from clinzor-static-web src/App.css :root variables.
// Never hardcode hex values outside this file.

export const COLORS = {
  primary: '#1A1C6B', // navy — primary brand, headings, dark sections
  primaryDark: '#2B2D8F', // navy hover / active
  primaryLight: '#0071E3', // blue — interactive accent, buttons, links
  secondary: '#0060C9', // blue hover

  background: '#F5F5F7', // Apple-style light surface
  surface: '#FFFFFF', // card background
  border: 'rgba(26,28,107,0.08)',

  text: {
    primary: '#1D1D1F', // ink — headings, card titles
    secondary: '#6E6E73', // body / secondary text
    muted: '#86868B', // captions, meta
    inverse: '#FFFFFF',
  },

  status: {
    success: '#34C759', // green — live / success
    error: '#FF3B30',
    warning: '#FF9500', // gold — coming soon / warning
    info: '#0071E3',
  },

  video: {
    overlay: 'rgba(26,28,107,0.85)',
    controls: '#1A1C6B',
    controlsText: '#FFFFFF',
    clinzorBadge: '#0071E3',
  },
} as const

export const FONTS = {
  heading: "'Nunito', sans-serif",
  body: "'Inter', sans-serif",
} as const

export const RADII = {
  sm: '8px',
  md: '16px',
  lg: '24px',
} as const

export const SHADOWS = {
  sm: '0 2px 12px rgba(26,28,107,0.07)',
  md: '0 6px 32px rgba(26,28,107,0.10)',
  lg: '0 12px 48px rgba(26,28,107,0.14)',
} as const
