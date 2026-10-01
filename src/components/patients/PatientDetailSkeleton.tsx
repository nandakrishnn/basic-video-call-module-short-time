import { Card } from '@/components/shared/Card'
import { DashboardSidebar } from '@/components/shared/DashboardSidebar'
import { Skeleton, SkeletonCircle } from '@/components/shared/Skeleton'
import { COLORS } from '@/constants/colors'

const SESSION_ROWS = 3

/**
 * Mirrors the patient page's shape — profile card, then session cards — so the
 * layout does not jump when the history arrives. The sidebar is the live one,
 * since it renders from auth state that has already resolved.
 */
export const PatientDetailSkeleton = (): JSX.Element => (
  <div className="app-shell" style={{ minHeight: '100vh', background: COLORS.background }}>
    <DashboardSidebar />

    <div
      className="dashboard-content"
      style={{ maxWidth: 1000, padding: '28px 36px 56px', display: 'flex', flexDirection: 'column', gap: 22 }}
      aria-busy="true"
      aria-live="polite"
    >
      <Skeleton width={120} height={14} />

      <Card padding={24} elevation="sm" style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
        <SkeletonCircle size={60} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: '1 1 220px' }}>
          <Skeleton width={200} height={24} radius="md" />
          <Skeleton width={150} height={14} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: '1 1 200px' }}>
          <Skeleton width={120} height={14} />
          <Skeleton width={180} height={14} />
        </div>
      </Card>

      <Skeleton width={160} height={16} />

      {Array.from({ length: SESSION_ROWS }, (_, i) => (
        <Card key={i} padding={20} elevation="sm" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Skeleton width={140} height={12} />
              <Skeleton width={220} height={18} radius="md" />
            </div>
            <Skeleton width={110} height={28} radius="pill" />
          </div>
          <Skeleton height={82} radius="md" />
        </Card>
      ))}
    </div>
  </div>
)
