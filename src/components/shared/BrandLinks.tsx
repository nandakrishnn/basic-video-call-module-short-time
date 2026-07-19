import Image from 'next/image'
import { Logo } from '@/components/shared/Logo'
import { RADII } from '@/constants/colors'
import { MESSAGES } from '@/constants/messages'

const CLINZOR_URL = 'https://clinzor.com'
const YORPHYSIO_URL = 'https://yorphysio.com'

const DARK_BG = '#241A13'
const CREAM_BG = '#F4EAE0'

const eyebrowStyle = (color: string) => ({
  color,
  fontSize: '0.72rem',
  fontWeight: 700,
  textTransform: 'uppercase' as const,
  letterSpacing: 1,
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
        <div
          style={{
            background: DARK_BG,
            borderRadius: RADII.lg,
            padding: 28,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          <Logo surface="dark" size="md" />
          <span style={eyebrowStyle('rgba(255,255,255,0.55)')}>{MESSAGES.brand.clinzorEyebrow}</span>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
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
        <div
          style={{
            background: CREAM_BG,
            borderRadius: RADII.lg,
            padding: 28,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Image
              src="/yorphysio-mark.webp"
              alt="YorPhysio"
              width={32}
              height={32}
              style={{ borderRadius: 8, height: 32, width: 32 }}
            />
            <span style={{ color: DARK_BG, fontSize: '1.05rem', fontWeight: 800 }}>YorPhysio</span>
          </div>
          <span style={eyebrowStyle('rgba(36,26,19,0.55)')}>{MESSAGES.brand.yorphysioEyebrow}</span>
          <p style={{ color: 'rgba(36,26,19,0.8)', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
            {MESSAGES.brand.yorphysioBody}
          </p>
        </div>
      </a>
    </div>
  )
}
