import { useRouter } from 'next/router'
import { useState } from 'react'
import { COLORS } from '@/constants/colors'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/hooks/useAuth'

const LoginPage = (): JSX.Element => {
  const router = useRouter()
  const { redirect } = router.query as { redirect?: string }
  const { login, error, isLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (): Promise<void> => {
    const success = await login(email, password)
    if (success) void router.push(redirect ?? ROUTES.dashboardPhysio)
  }

  const fieldStyle = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: 10,
    border: `1px solid ${COLORS.border}`,
    color: COLORS.text.primary,
  }

  return (
    <div
      style={{
        maxWidth: 380,
        margin: '100px auto',
        padding: 32,
        borderRadius: 16,
        background: COLORS.surface,
        boxShadow: '0 6px 32px rgba(26,28,107,0.10)',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      <h1 style={{ color: COLORS.text.primary, fontSize: '1.2rem', fontWeight: 800, marginBottom: 8 }}>
        Sign in to Clinzor
      </h1>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        style={fieldStyle}
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        style={fieldStyle}
      />
      <button
        type="button"
        disabled={isLoading || !email || !password}
        onClick={() => void handleSubmit()}
        style={{
          padding: '12px',
          borderRadius: 10,
          border: 'none',
          background: COLORS.primary,
          color: COLORS.text.inverse,
          fontWeight: 700,
          cursor: isLoading ? 'default' : 'pointer',
          opacity: isLoading ? 0.7 : 1,
        }}
      >
        {isLoading ? 'Signing in…' : 'Sign In'}
      </button>
      {error && <p style={{ color: COLORS.status.error, fontSize: '0.85rem' }}>{error}</p>}
    </div>
  )
}

export default LoginPage
