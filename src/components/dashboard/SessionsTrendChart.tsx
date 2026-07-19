import { useState } from 'react'
import { COLORS } from '@/constants/colors'

interface SessionsTrendChartProps {
  data: { date: string; count: number }[]
}

const CHART_WIDTH = 400
const CHART_HEIGHT = 120
const BASELINE_Y = CHART_HEIGHT - 1
const BAR_GAP = 3
const MAX_BAR_WIDTH = 20
const BAR_RADIUS = 4

const roundedTopBarPath = (x: number, y: number, width: number, height: number): string => {
  const r = Math.min(BAR_RADIUS, height, width / 2)
  return [
    `M${x},${y + height}`,
    `L${x},${y + r}`,
    `Q${x},${y} ${x + r},${y}`,
    `L${x + width - r},${y}`,
    `Q${x + width},${y} ${x + width},${y + r}`,
    `L${x + width},${y + height}`,
    'Z',
  ].join(' ')
}

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })

export const SessionsTrendChart = ({ data }: SessionsTrendChartProps): JSX.Element => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  const maxCount = Math.max(1, ...data.map((d) => d.count))
  const barWidth = Math.min(MAX_BAR_WIDTH, (CHART_WIDTH - BAR_GAP * (data.length - 1)) / data.length)
  const totalBarsWidth = barWidth * data.length + BAR_GAP * (data.length - 1)
  const startX = (CHART_WIDTH - totalBarsWidth) / 2
  const plotHeight = CHART_HEIGHT - 24

  const hoveredPoint = hoverIndex !== null ? data[hoverIndex] : undefined
  const firstPoint = data[0]
  const lastPoint = data[data.length - 1]

  return (
    <div style={{ position: 'relative' }}>
      <svg
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        preserveAspectRatio="none"
        width="100%"
        height={CHART_HEIGHT}
        role="img"
        aria-label="Sessions over the last 14 days"
      >
        <line x1={0} y1={BASELINE_Y} x2={CHART_WIDTH} y2={BASELINE_Y} stroke={COLORS.border} strokeWidth={1} />
        {data.map((d, i) => {
          const barHeight = d.count === 0 ? 0 : Math.max(4, (d.count / maxCount) * plotHeight)
          const x = startX + i * (barWidth + BAR_GAP)
          const y = BASELINE_Y - barHeight
          const isHovered = hoverIndex === i

          return (
            <g key={d.date}>
              {barHeight > 0 && (
                <path
                  d={roundedTopBarPath(x, y, barWidth, barHeight)}
                  fill={isHovered ? COLORS.primary : COLORS.primaryLight}
                />
              )}
              <rect
                x={x}
                y={0}
                width={barWidth}
                height={CHART_HEIGHT}
                fill="transparent"
                tabIndex={0}
                onPointerEnter={() => setHoverIndex(i)}
                onPointerLeave={() => setHoverIndex((prev) => (prev === i ? null : prev))}
                onFocus={() => setHoverIndex(i)}
                onBlur={() => setHoverIndex((prev) => (prev === i ? null : prev))}
              />
            </g>
          )
        })}
      </svg>

      {hoverIndex !== null && hoveredPoint && (
        <div
          style={{
            position: 'absolute',
            left: `${((startX + hoverIndex * (barWidth + BAR_GAP) + barWidth / 2) / CHART_WIDTH) * 100}%`,
            top: 0,
            transform: 'translate(-50%, -100%)',
            background: COLORS.primary,
            color: COLORS.text.inverse,
            borderRadius: 8,
            padding: '6px 10px',
            fontSize: '0.75rem',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        >
          <strong>{hoveredPoint.count}</strong> {hoveredPoint.count === 1 ? 'session' : 'sessions'}
          <div style={{ opacity: 0.75, fontSize: '0.68rem' }}>{formatDate(hoveredPoint.date)}</div>
        </div>
      )}

      {firstPoint && lastPoint && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
          <span style={{ color: COLORS.text.muted, fontSize: '0.7rem' }}>{formatDate(firstPoint.date)}</span>
          <span style={{ color: COLORS.text.muted, fontSize: '0.7rem' }}>{formatDate(lastPoint.date)}</span>
        </div>
      )}
    </div>
  )
}
