import { DashboardSidebar } from '@/components/shared/DashboardSidebar'
import { Skeleton, SkeletonCircle } from '@/components/shared/Skeleton'
import { COLORS, RADII } from '@/constants/colors'

interface ListPageSkeletonProps {
  /** 'grid' matches the Patients card grid, 'rows' the Bookings list. */
  variant?: 'grid' | 'rows'
  /** Pills above the list, as on the Bookings filters. */
  filterCount?: number
  rows?: number
}

const rowShell = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '14px 16px',
  borderRadius: RADII.md,
  border: `1px solid ${COLORS.border}`,
  background: COLORS.surface,
}

/** Shared loading shape for the Patients and Bookings pages. */
export const ListPageSkeleton = ({
  variant = 'rows',
  filterCount = 0,
  rows = 5,
}: ListPageSkeletonProps): JSX.Element => (
  <div className="app-shell" style={{ minHeight: '100vh', background: COLORS.background }}>
    <DashboardSidebar />

    <div
      className="dashboard-content"
      style={{ maxWidth: 1240, padding: '32px 40px 60px', display: 'flex', flexDirection: 'column', gap: 24 }}
      aria-busy="true"
      aria-live="polite"
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          <Skeleton width={190} height={28} radius="md" />
          <Skeleton width={260} height={15} />
        </div>
        <Skeleton width={152} height={46} radius="md" />
      </div>

      {filterCount > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {Array.from({ length: filterCount }, (_, i) => (
            <Skeleton key={i} width={96 + (i % 3) * 18} height={40} radius="pill" />
          ))}
        </div>
      )}

      {variant === 'grid' && <Skeleton height={46} radius="sm" style={{ maxWidth: 420 }} />}

      <div className={variant === 'grid' ? 'patient-grid' : 'skeleton-rows'}>
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} style={rowShell}>
            <SkeletonCircle size={38} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7, flex: 1, minWidth: 0 }}>
              <Skeleton width="45%" height={14} />
              <Skeleton width="70%" height={12} />
            </div>
            {variant === 'rows' && <Skeleton width={104} height={30} radius="pill" />}
          </div>
        ))}
      </div>
    </div>
  </div>
)
