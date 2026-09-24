import Image from 'next/image'
import { COLORS, FONT_SIZES, RADII } from '@/constants/colors'
import { MESSAGES } from '@/constants/messages'

const CLINZOR_URL = 'https://clinzor.com'
const YORPHYSIO_URL = 'https://yorphysio.com'

// The Clinzor card renders its own wordmark asset directly — the shared Logo
// component carries YorPhysio branding and must not stand in for Clinzor here.
const CLINZOR_LOGO = { src: '/logo-white.png', ratio: 922 / 390 }
const CLINZOR_LOGO_HEIGHT = 28

const eyebrowStyle = (color: string) => ({
  color,
  fontSize: FONT_SIZES.xs,
  fontWeight: 700,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.1em',
})

const cardStyle = (background: string) => ({
  background,
  borderRadius: RADII.xl,
  padding: 28,
  height: '100%',
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 14,
})

export const BrandLinks = (): JSX.Element => {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'stretch', justifyContent: 'center' }}>
      <a
        href={CLINZOR_URL}
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: 'none', flex: '1 1 280px', maxWidth: 360 }}
      >
        <div style={cardStyle(COLORS.accent)}>
          <Image
            src={CLINZOR_LOGO.src}
            alt="Clinzor"
            width={Math.round(CLINZOR_LOGO_HEIGHT * CLINZOR_LOGO.ratio)}
            height={CLINZOR_LOGO_HEIGHT}
            style={{ height: CLINZOR_LOGO_HEIGHT, width: 'auto', objectFit: 'contain' }}
          />
          <span style={eyebrowStyle(COLORS.onDark.muted)}>{MESSAGES.brand.clinzorEyebrow}</span>
          <p style={{ color: COLORS.onDark.strong, fontSize: FONT_SIZES.md, lineHeight: 1.6, margin: 0 }}>
            {MESSAGES.brand.clinzorBody}
          </p>
        </div>
      </a>

      <a
        href={YORPHYSIO_URL}
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: 'none', flex: '1 1 280px', maxWidth: 360 }}
      >
        <div style={cardStyle(COLORS.primarySoft)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Image
              src="/yorphysio-mark.webp"
              alt="YorPhysio"
              width={32}
              height={32}
              style={{ borderRadius: RADII.sm, height: 32, width: 32 }}
            />
            <span style={{ color: COLORS.accent, fontSize: FONT_SIZES.lg, fontWeight: 800 }}>YorPhysio</span>
          </div>
          <span style={eyebrowStyle(COLORS.text.secondary)}>{MESSAGES.brand.yorphysioEyebrow}</span>
          <p style={{ color: COLORS.text.primary, fontSize: FONT_SIZES.md, lineHeight: 1.6, margin: 0 }}>
            {MESSAGES.brand.yorphysioBody}
          </p>
        </div>
      </a>
    </div>
  )
}
