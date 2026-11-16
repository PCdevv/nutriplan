import { formatGrams } from '../../utils/calorieUtils'

/**
 * MacroBar — Visual progress breakdown for Protein, Carbs, and Fat.
 */
export default function MacroBar({
  protein = 0,
  carbs = 0,
  fat = 0,
  proteinGoal = 120,
  carbsGoal = 250,
  fatGoal = 65,
}) {
  const macros = [
    {
      label: 'Protein',
      current: protein,
      goal: proteinGoal,
      color: '#3b82f6', // blue
      bg: '#dbeafe',
    },
    {
      label: 'Karbohidrat',
      current: carbs,
      goal: carbsGoal,
      color: '#f59e0b', // amber
      bg: '#fef3c7',
    },
    {
      label: 'Lemak',
      current: fat,
      goal: fatGoal,
      color: '#ec4899', // pink
      bg: '#fce7f3',
    },
  ]

  return (
    <div className="macro-bar-widget">
      <h3 className="widget-title">Target Makronutrisi</h3>
      <div className="macro-grid">
        {macros.map((m) => {
          const percent = Math.min(Math.round((m.current / Math.max(m.goal, 1)) * 100), 100)

          return (
            <div key={m.label} className="macro-item">
              <div className="macro-head">
                <span className="macro-name">{m.label}</span>
                <span className="macro-val">
                  <strong>{formatGrams(m.current)}</strong> / {formatGrams(m.goal)}
                </span>
              </div>
              <div className="macro-track" style={{ backgroundColor: m.bg }}>
                <div
                  className="macro-fill"
                  style={{
                    width: `${percent}%`,
                    backgroundColor: m.color,
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
