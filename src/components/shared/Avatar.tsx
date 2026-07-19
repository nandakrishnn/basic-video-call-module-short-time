import { COLORS } from '@/constants/colors'

interface AvatarProps {
  name: string
  size?: number
}

const PALETTE = ['#1A1C6B', '#0071E3', '#8E44AD', '#16A085', '#D35400']

const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : ''
  return (first + last).toUpperCase()
}

const getColor = (name: string): string => {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return PALETTE[Math.abs(hash) % PALETTE.length] as string
}

export const Avatar = ({ name, size = 36 }: AvatarProps): JSX.Element => {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: getColor(name),
        color: COLORS.text.inverse,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: size * 0.4,
        flexShrink: 0,
      }}
    >
      {getInitials(name) || '?'}
    </div>
  )
}
