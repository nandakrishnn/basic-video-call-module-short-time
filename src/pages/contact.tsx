import { BrandLinks } from '@/components/shared/BrandLinks'
import { DashboardSidebar } from '@/components/shared/DashboardSidebar'
import { COLORS } from '@/constants/colors'
import { MESSAGES } from '@/constants/messages'
import { useAuth } from '@/hooks/useAuth'

const ContactPage = (): JSX.Element => {
  const { user } = useAuth()
  const isPhysio = user?.role === 'physio'

  const content = (
    <>
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        <h1 style={{ color: COLORS.text.primary, fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>
          {MESSAGES.contact.title}
        </h1>
        <p style={{ color: COLORS.text.secondary, fontSize: '0.95rem', margin: '10px 0 0', lineHeight: 1.6 }}>
          {MESSAGES.contact.body}
        </p>
      </div>
      <BrandLinks />
    </>
  )

  if (isPhysio) {
    return (
      <div style={{ minHeight: '100vh', background: COLORS.background }}>
        <DashboardSidebar />
        <div
          className="dashboard-content"
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 32,
            padding: '60px 20px',
          }}
        >
          {content}
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 32,
        background: COLORS.background,
        padding: '60px 20px',
      }}
    >
      {content}
    </div>
  )
}

export default ContactPage
