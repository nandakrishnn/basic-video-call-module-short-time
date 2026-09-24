import { COLORS, FONT_SIZES, RADII } from '@/constants/colors'
import { MESSAGES } from '@/constants/messages'

/**
 * The decorative circles are drawn in CSS rather than shipped as artwork, so
 * the banner needs no image asset and recolours with the theme. Drop a photo in
 * later by giving .dash-hero a background-image on its right-hand side.
 */
export const HeroBanner = (): JSX.Element => (
  <section className="dash-hero" aria-hidden="false">
    <h2
      style={{
        position: 'relative',
        zIndex: 1,
        color: COLORS.primaryStrong,
        fontSize: FONT_SIZES['2xl'],
        fontWeight: 800,
        lineHeight: 1.25,
        margin: 0,
        maxWidth: 380,
      }}
    >
      {MESSAGES.dashboard.heroTitle}
    </h2>

    <span className="dash-hero-circle dash-hero-circle-lg" style={{ borderRadius: RADII.pill }} />
    <span className="dash-hero-circle dash-hero-circle-sm" style={{ borderRadius: RADII.pill }} />
  </section>
)
