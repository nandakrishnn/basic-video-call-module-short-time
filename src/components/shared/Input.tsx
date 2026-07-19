import type { CSSProperties, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { COLORS, RADII } from '@/constants/colors'

const fieldStyle: CSSProperties = {
  width: '100%',
  padding: '12px 16px',
  borderRadius: RADII.sm,
  border: `1px solid ${COLORS.border}`,
  background: COLORS.surface,
  color: COLORS.text.primary,
  fontSize: '1rem',
}

export const Input = ({ style, ...rest }: InputHTMLAttributes<HTMLInputElement>): JSX.Element => (
  <input style={{ ...fieldStyle, ...style }} {...rest} />
)

export const Textarea = ({ style, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>): JSX.Element => (
  <textarea style={{ ...fieldStyle, resize: 'vertical', fontFamily: 'inherit', ...style }} {...rest} />
)

export const Select = ({ style, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>): JSX.Element => (
  <select style={{ ...fieldStyle, cursor: 'pointer', ...style }} {...rest}>
    {children}
  </select>
)
