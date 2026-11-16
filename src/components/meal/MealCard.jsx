import { Plus, Flame } from 'lucide-react'
import FavoriteButton from '../common/FavoriteButton'
import { truncate } from '../../utils/helpers'
import { formatCalories } from '../../utils/calorieUtils'

/**
 * MealCard — Card component for displaying food item in the Catalog.
 *
 * @param {Object} props
 * @param {Object} props.meal
 * @param {Function} props.onSelect
 * @param {Function} [props.onAddToPlan]
 * @param {Function} [props.onEdit]
 * @param {Function} [props.onDelete]
 */
export default function MealCard({ meal, onSelect, onAddToPlan, onEdit, onDelete }) {
  const imgSrc =
    meal.image_url ||
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'

  return (
    <li className="meal-card">
      <div className="meal-card__media-wrap" onClick={() => onSelect(meal)}>
        <img
          className="meal-card__img"
          src={imgSrc}
          alt={meal.name}
          width="260"
          height="170"
          loading="lazy"
        />
        <span className="meal-card__category">{meal.category || 'Lunch'}</span>

        {/* Favorite floating button */}
        <div className="meal-card__fav">
          <FavoriteButton mealId={meal.id || meal.name} />
        </div>
      </div>

      <div className="meal-card__body">
        <button
          type="button"
          className="meal-card__title-btn"
          onClick={() => onSelect(meal)}
        >
          <h3 className="meal-card__name">{meal.name}</h3>
        </button>

        {meal.description && (
          <p className="meal-card__desc">{truncate(meal.description, 68)}</p>
        )}

        <div className="meal-card__calories">
          <Flame size={18} className="calorie-flame-icon" />
          <span className="calorie-number">{formatCalories(meal.calories)}</span>
          {meal.serving_size && (
            <span className="calorie-serving">/ {meal.serving_size}</span>
          )}
        </div>

        {/* Macros summary */}
        <div className="meal-card__macros">
          <span className="macro-chip macro-chip--pro">P: {meal.protein || 0}g</span>
          <span className="macro-chip macro-chip--carb">C: {meal.carbs || 0}g</span>
          <span className="macro-chip macro-chip--fat">F: {meal.fat || 0}g</span>
        </div>

        {/* Action row */}
        <div className="meal-card__actions">
          {onAddToPlan && (
            <button
              type="button"
              className="btn btn--primary btn--sm meal-card__add-btn"
              onClick={() => onAddToPlan(meal)}
              title="Tambahkan ke rencana makan"
            >
              <Plus size={15} /> Rencanakan
            </button>
          )}

          {onEdit && (
            <button
              type="button"
              className="icon-btn"
              onClick={() => onEdit(meal)}
              title="Edit menu"
              aria-label="Edit menu"
            >
              ✏️
            </button>
          )}

          {onDelete && (
            <button
              type="button"
              className="icon-btn icon-btn--danger"
              onClick={() => onDelete(meal)}
              title="Hapus menu"
              aria-label="Hapus menu"
            >
              🗑️
            </button>
          )}
        </div>
      </div>
    </li>
  )
}
