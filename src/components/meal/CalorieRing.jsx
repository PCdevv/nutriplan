/**
 * CalorieRing — Circular SVG progress visualization for calorie consumption vs goal.
 */
export default function CalorieRing({ consumed = 0, goal = 2000 }) {
  const safeGoal = Math.max(goal, 1)
  const percent = Math.min(Math.round((consumed / safeGoal) * 100), 150)
  const remaining = Math.max(goal - consumed, 0)
  const isOver = consumed > goal

  // SVG ring parameters
  const size = 160
  const strokeWidth = 14
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (Math.min(percent, 100) / 100) * circumference

  return (
    <div className="calorie-ring-widget">
      <div className="calorie-ring-svg-wrap">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="calorie-ring-svg"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--line)"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={isOver ? 'var(--danger)' : 'var(--primary)'}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ transition: 'stroke-dashoffset 0.6s ease-in-out' }}
          />
        </svg>

        {/* Inner text */}
        <div className="calorie-ring-center">
          <span className="calorie-ring-val">{consumed.toLocaleString('id-ID')}</span>
          <span className="calorie-ring-unit">kkal dikonsumsi</span>
          <span className={`calorie-ring-badge ${isOver ? 'badge--danger' : ''}`}>
            {percent}%
          </span>
        </div>
      </div>

      <div className="calorie-ring-meta">
        <div className="meta-col">
          <span className="meta-label">Target Harian</span>
          <span className="meta-num">{goal.toLocaleString('id-ID')} kkal</span>
        </div>
        <div className="meta-divider" />
        <div className="meta-col">
          <span className="meta-label">{isOver ? 'Kelebihan' : 'Sisa Kalori'}</span>
          <span className={`meta-num ${isOver ? 'text-danger' : 'text-primary'}`}>
            {isOver ? `+${(consumed - goal).toLocaleString('id-ID')}` : remaining.toLocaleString('id-ID')} kkal
          </span>
        </div>
      </div>
    </div>
  )
}
