import { useState } from 'react'
import { ArrowLeft, Flame, CalendarPlus, Check, Sparkles } from 'lucide-react'
import FavoriteButton from '../common/FavoriteButton'
import { formatCalories } from '../../utils/calorieUtils'

/**
 * MealDetail — Full view of a meal with nutrition facts and plan action.
 */
export default function MealDetail({ meal, onBack, onAddToPlan, onEdit, onDelete }) {
  const [selectedType, setSelectedType] = useState(meal.category?.toLowerCase() || 'lunch')
  const [servings, setServings] = useState(1)
  const [addedNotice, setAddedNotice] = useState(false)

  const imgSrc =
    meal.image_url ||
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'

  const handlePlan = () => {
    if (onAddToPlan) {
      onAddToPlan(meal, selectedType, servings)
      setAddedNotice(true)
      setTimeout(() => setAddedNotice(false), 2500)
    }
  }

  return (
    <div className="meal-detail">
      <button type="button" className="detail-back" onClick={onBack}>
        <ArrowLeft size={18} /> Kembali ke Menu
      </button>

      <div className="detail-hero">
        <div className="detail-hero__media">
          <img className="detail-img" src={imgSrc} alt={meal.name} />
          <span className="detail-badge">{meal.category || 'Lunch'}</span>
        </div>

        <div className="detail-info">
          <div className="detail-header-row">
            <h1 className="detail-title">{meal.name}</h1>
            <FavoriteButton mealId={meal.id || meal.name} />
          </div>

          <div className="detail-cal-highlight">
            <Flame size={24} className="text-primary" />
            <span className="detail-cal-num">{formatCalories(meal.calories)}</span>
            <span className="detail-serving-text">/ {meal.serving_size || '1 porsi'}</span>
          </div>

          {/* Quick macro cards */}
          <div className="detail-macro-row">
            <div className="detail-macro-box box-protein">
              <span className="box-val">{meal.protein || 0}g</span>
              <span className="box-lbl">Protein</span>
            </div>
            <div className="detail-macro-box box-carbs">
              <span className="box-val">{meal.carbs || 0}g</span>
              <span className="box-lbl">Karbohidrat</span>
            </div>
            <div className="detail-macro-box box-fat">
              <span className="box-val">{meal.fat || 0}g</span>
              <span className="box-lbl">Lemak</span>
            </div>
          </div>

          {/* Add to plan form */}
          <div className="detail-plan-box">
            <h3 className="plan-box-title">
              <CalendarPlus size={16} /> Masukkan ke Jadwal Makan
            </h3>

            <div className="plan-box-controls">
              <div className="control-group">
                <label className="control-label">Waktu Makan</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="form-select form-select--sm"
                >
                  <option value="breakfast">Sarapan (Breakfast)</option>
                  <option value="lunch">Makan Siang (Lunch)</option>
                  <option value="dinner">Makan Malam (Dinner)</option>
                  <option value="snack">Cemilan (Snack)</option>
                </select>
              </div>

              <div className="control-group">
                <label className="control-label">Jumlah Porsi</label>
                <select
                  value={servings}
                  onChange={(e) => setServings(Number(e.target.value))}
                  className="form-select form-select--sm"
                >
                  <option value="0.5">0.5 Porsi</option>
                  <option value="1">1 Porsi</option>
                  <option value="1.5">1.5 Porsi</option>
                  <option value="2">2 Porsi</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              className="btn btn--primary detail-plan-submit"
              onClick={handlePlan}
            >
              {addedNotice ? (
                <>
                  <Check size={18} /> Berhasil Ditambahkan ke Rencana!
                </>
              ) : (
                <>
                  <Sparkles size={18} /> Tambahkan ke Hari Ini
                </>
              )}
            </button>
          </div>

          {/* Admin edit/delete buttons */}
          <div className="detail-admin-actions">
            {onEdit && (
              <button
                type="button"
                className="btn btn--outline btn--sm"
                onClick={() => onEdit(meal)}
              >
                ✏️ Edit Resep
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                className="btn btn--danger-ghost btn--sm"
                onClick={() => onDelete(meal)}
              >
                🗑️ Hapus Menu
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      {meal.description && (
        <section className="detail-section">
          <h2>Deskripsi Menu</h2>
          <p className="detail-desc-text">{meal.description}</p>
        </section>
      )}

      {/* Ingredients */}
      {meal.ingredients && meal.ingredients.length > 0 && (
        <section className="detail-section">
          <h2>Komposisi &amp; Takaran Bahan</h2>
          <ul className="detail-ingredients-grid">
            {meal.ingredients.map((ing, i) => (
              <li key={ing.id || i} className="ingredient-item">
                <span className="ingredient-name">{ing.name}</span>
                <span className="ingredient-qty">{ing.quantity}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
