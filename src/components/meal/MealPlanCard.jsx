import { Trash2, Plus, Minus, Flame } from 'lucide-react'
import { formatCalories } from '../../utils/calorieUtils'

/**
 * MealPlanCard — Item card for daily meal plan lists.
 */
export default function MealPlanCard({ planItem, onRemove, onUpdateServings }) {
  const meal = planItem.meal || {}
  const servings = Number(planItem.servings || 1)
  const totalItemCalories = Math.round((Number(meal.calories || 0) * servings))

  return (
    <div className="plan-item-card">
      <img
        src={
          meal.image_url ||
          'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'
        }
        alt={meal.name || 'Menu'}
        className="plan-item-thumb"
      />

      <div className="plan-item-info">
        <h4 className="plan-item-name">{meal.name || 'Menu Sehat'}</h4>
        <div className="plan-item-cal">
          <Flame size={14} className="text-primary" />
          <span>{formatCalories(totalItemCalories)}</span>
          <span className="plan-item-base-cal">
            ({meal.calories || 0} kkal / porsi)
          </span>
        </div>
        <div className="plan-item-macros">
          <span>P: {Math.round((meal.protein || 0) * servings)}g</span>
          <span>C: {Math.round((meal.carbs || 0) * servings)}g</span>
          <span>F: {Math.round((meal.fat || 0) * servings)}g</span>
        </div>
      </div>

      <div className="plan-item-controls">
        {/* Servings adjustment */}
        <div className="servings-counter">
          <button
            type="button"
            className="servings-btn"
            onClick={() => onUpdateServings && onUpdateServings(planItem.id, Math.max(0.5, servings - 0.5))}
            disabled={servings <= 0.5}
            title="Kurangi porsi"
            aria-label="Kurangi porsi"
          >
            <Minus size={12} />
          </button>
          <span className="servings-val">{servings}x</span>
          <button
            type="button"
            className="servings-btn"
            onClick={() => onUpdateServings && onUpdateServings(planItem.id, servings + 0.5)}
            title="Tambah porsi"
            aria-label="Tambah porsi"
          >
            <Plus size={12} />
          </button>
        </div>

        {/* Remove */}
        <button
          type="button"
          className="plan-item-remove-btn"
          onClick={() => onRemove && onRemove(planItem.id)}
          title="Hapus dari rencana makan"
          aria-label="Hapus dari rencana"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  )
}
