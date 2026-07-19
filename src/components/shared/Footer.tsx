import Link from 'next/link'
import { COLORS } from '@/constants/colors'
import { MESSAGES } from '@/constants/messages'
import { ROUTES } from '@/constants/routes'

export const Footer = (): JSX.Element => {
  return (
    <footer style={{ textAlign: 'center', padding: '32px 0' }}>
      <Link href={ROUTES.contact} style={{ color: COLORS.text.muted, fontSize: '0.85rem', textDecoration: 'none' }}>
        {MESSAGES.brand.contactLink}
      </Link>
    </footer>
  )
}
