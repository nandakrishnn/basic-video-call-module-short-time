import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { Button } from '@/components/shared/Button'
import { Card } from '@/components/shared/Card'
import { Input } from '@/components/shared/Input'
import { Logo } from '@/components/shared/Logo'
import { COLORS } from '@/constants/colors'
import { MESSAGES } from '@/constants/messages'
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

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: COLORS.background,
        padding: 20,
      }}
    >
      <Card elevation="md" style={{ width: '100%', maxWidth: 380, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <Logo surface="light" size="lg" />
          <h1 style={{ color: COLORS.text.primary, fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Sign in</h1>
        </div>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        <Button
          variant="primary"
          fullWidth
          disabled={!email || !password}
          isLoading={isLoading}
          onClick={() => void handleSubmit()}
        >
          {isLoading ? 'Signing in…' : 'Sign In'}
        </Button>
        {error && <p style={{ color: COLORS.status.error, fontSize: '0.85rem', margin: 0 }}>{error}</p>}

        <p style={{ textAlign: 'center', color: COLORS.text.muted, fontSize: '0.8rem', margin: 0 }}>
          {MESSAGES.login.patientLinkBody}{' '}
          <Link
            href={ROUTES.patientLogin}
            style={{ color: COLORS.primaryLight, fontWeight: 600, textDecoration: 'none' }}
          >
            {MESSAGES.login.patientLinkLabel}
          </Link>
        </p>
      </Card>
    </div>
  )
}

export default LoginPage
