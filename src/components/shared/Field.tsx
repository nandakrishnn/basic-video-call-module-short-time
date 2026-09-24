import type { ReactNode } from 'react'

interface FieldProps {
  label: string
  children: ReactNode
}

/** Label + control pair. Keeps form markup consistent across every dialog. */
export const Field = ({ label, children }: FieldProps): JSX.Element => (
  <label style={{ display: 'flex', flexDirection: 'column', gap: 7, minWidth: 0 }}>
    <span className="field-label">{label}</span>
    {children}
  </label>
)
