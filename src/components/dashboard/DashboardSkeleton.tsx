import { Card } from '@/components/shared/Card'
import { DashboardSidebar } from '@/components/shared/DashboardSidebar'
import { Skeleton, SkeletonCircle } from '@/components/shared/Skeleton'
import { COLORS, RADII } from '@/constants/colors'

const ROWS = 4

/**
 * Mirrors the real dashboard's shape — topbar, hero, next session, table — so
 * the layout doesn't jump when the data arrives. The sidebar is the live one:
 * it renders from auth state that's already resolved, and showing real nav
 * during load keeps the page usable rather than blanking it.
 */
export const DashboardSkeleton = (): JSX.Element => (
  <div className="app-shell" style={{ minHeight: '100vh', background: COLORS.background }}>
    <DashboardSidebar />

    <div
      className="dashboard-content"
      style={{ maxWidth: 1320, padding: '28px 36px 56px', display: 'flex', flexDirection: 'column', gap: 22 }}
      aria-busy="true"
      aria-live="polite"
    >
      <div className="dash-topbar">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Skeleton width={110} height={13} />
          <Skeleton width={240} height={30} radius="md" />
        </div>
        <div className="dash-topbar-actions">
          <Skeleton height={46} radius="pill" style={{ flex: '1 1 300px', maxWidth: 420 }} />
          <SkeletonCircle size={44} />
        </div>
      </div>

      <Skeleton height={176} radius="lg" />

      <Card padding={22} elevation="sm" style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Skeleton width={84} height={12} />
          <Skeleton width={120} height={26} radius="md" />
          <Skeleton width={150} height={13} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 13, flex: '1 1 220px' }}>
          <SkeletonCircle size={46} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7, flex: 1, maxWidth: 220 }}>
            <Skeleton width="70%" height={16} />
            <Skeleton width="50%" height={13} />
          </div>
        </div>
        <Skeleton width={168} height={48} radius="md" />
      </Card>

      <Card padding={0} elevation="sm">
        <div
          className="dash-table-toolbar"
          style={{ padding: '16px 18px', borderBottom: `1px solid ${COLORS.border}` }}
        >
          <div style={{ display: 'flex', gap: 20 }}>
            <Skeleton width={58} height={16} />
            <Skeleton width={78} height={16} />
            <Skeleton width={86} height={16} />
          </div>
          <div style={{ display: 'flex', gap: 12, paddingBottom: 0 }}>
            <Skeleton width={190} height={44} radius="sm" />
            <Skeleton width={132} height={44} radius="md" />
          </div>
        </div>

        {Array.from({ length: ROWS }, (_, i) => (
          <div
            key={i}
            style={{
              display: 'grid',
              gridTemplateColumns: '90px minmax(0, 1fr) minmax(0, 1fr) 110px 180px',
              alignItems: 'center',
              gap: 18,
              padding: '16px 18px',
              borderTop: `1px solid ${COLORS.border}`,
            }}
          >
            <Skeleton width={62} height={18} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
              <SkeletonCircle size={38} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, maxWidth: 170 }}>
                <Skeleton width="80%" height={14} />
                <Skeleton width="55%" height={12} />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: 160 }}>
              <Skeleton width="65%" height={14} />
              <Skeleton width="40%" height={12} />
            </div>
            <Skeleton width={86} height={24} radius="pill" />
            <Skeleton height={34} radius="md" style={{ borderRadius: RADII.md, justifySelf: 'end', width: 150 }} />
          </div>
        ))}
      </Card>
    </div>
  </div>
)
