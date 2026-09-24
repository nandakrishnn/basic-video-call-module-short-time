import { Avatar } from '@/components/shared/Avatar'
import { SearchInput } from '@/components/shared/SearchInput'
import { COLORS, FONT_SIZES } from '@/constants/colors'
import { MESSAGES } from '@/constants/messages'

interface DashboardTopbarProps {
  fullName: string
  query: string
  onQueryChange: (value: string) => void
}

const greetingFor = (hour: number): string => {
  if (hour < 12) return MESSAGES.dashboard.greetingMorning
  if (hour < 17) return MESSAGES.dashboard.greetingAfternoon
  return MESSAGES.dashboard.greetingEvening
}

export const DashboardTopbar = ({ fullName, query, onQueryChange }: DashboardTopbarProps): JSX.Element => (
  <header className="dash-topbar">
    <div style={{ minWidth: 0 }}>
      <p style={{ color: COLORS.text.secondary, fontSize: FONT_SIZES.md, margin: 0 }}>
        {greetingFor(new Date().getHours())}
      </p>
      <h1
        style={{
          color: COLORS.text.primary,
          fontSize: FONT_SIZES['2xl'],
          fontWeight: 800,
          margin: '2px 0 0',
          lineHeight: 1.2,
        }}
      >
        {fullName}
      </h1>
    </div>

    <div className="dash-topbar-actions">
      <SearchInput
        value={query}
        onChange={onQueryChange}
        placeholder={MESSAGES.dashboard.searchPlaceholder}
        style={{ flex: '1 1 300px', maxWidth: 420 }}
        pill
      />
      <Avatar name={fullName} size={44} />
    </div>
  </header>
)
