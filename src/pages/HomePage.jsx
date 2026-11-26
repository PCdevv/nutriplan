import { useMemo, useState } from 'react'
import {
  ArrowRight,
  CalendarDays,
  Coffee,
  Cookie,
  Flame,
  Heart,
  Moon,
  Plus,
  Sun,
  UtensilsCrossed,
} from 'lucide-react'
import CalorieRing from '../components/meal/CalorieRing'
import MealCard from '../components/meal/MealCard'
import { useMeals } from '../hooks/useMeals'
import { useFavorites } from '../hooks/useFavorites'
import MEALS_LOCAL from '../data/meals'
import { getUserProfile } from '../services/userService'
import { formatCalories, formatGrams } from '../utils/calorieUtils'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 11) return 'Selamat Pagi'
  if (hour < 15) return 'Selamat Siang'
  if (hour < 18) return 'Selamat Sore'
  return 'Selamat Malam'
}

/**
 * HomePage — Landing dashboard with daily nutrition summary, quick actions, and featured meals.
 */
export default function HomePage({
  mealPlanState,
  onNavigate,
  onNavigateToCatalog,
  onAddToPlan,
}) {
  const [profile] = useState(() => getUserProfile())
  const { meals: apiMeals } = useMeals({ limit: 8 })
  const { favorites } = useFavorites()

  const totals = mealPlanState?.totals || {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    count: 0,
  }

  const calorieGoal = profile.calorieGoal || 2000
  const displayName = (profile.username || 'Pengguna').split('|')[0].trim()

  const featuredMeals = useMemo(() => {
    const source = apiMeals.length > 0 ? apiMeals : MEALS_LOCAL
    return source.slice(0, 4)
  }, [apiMeals])

  const quickCategories = [
    { id: 'Breakfast', label: 'Sarapan', icon: Coffee },
    { id: 'Lunch', label: 'Makan Siang', icon: Sun },
    { id: 'Dinner', label: 'Makan Malam', icon: Moon },
    { id: 'Snack', label: 'Cemilan', icon: Cookie },
  ]

  return (
    <div className="home-page">
      {/* Hero Greeting */}
      <section className="home-hero">
        <div className="home-hero__text">
          <span className="home-hero__eyebrow">{getGreeting()}, {displayName}</span>
          <h1 className="display">Rencanakan Nutrisi Harian Anda</h1>
          <p className="lede">
            Pantau asupan kalori, susun jadwal makan seimbang, dan simpan menu favorit dalam satu tempat.
          </p>
          <div className="home-hero__actions">
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => onNavigate('Planner')}
            >
              <CalendarDays size={16} /> Buka Planner
            </button>
            <button
              type="button"
              className="btn btn--outline"
              onClick={() => onNavigate('Foods')}
            >
              <UtensilsCrossed size={16} /> Jelajahi Katalog
            </button>
          </div>
        </div>
      </section>

      {/* Today's Nutrition Overview */}
      <section className="home-summary-card" aria-label="Ringkasan Nutrisi Hari Ini">
        <div className="home-summary-card__head">
          <div>
            <h2>Ringkasan Hari Ini</h2>
            <p className="text-secondary">
              {totals.count > 0
                ? `${totals.count} menu direncanakan hari ini`
                : 'Belum ada menu direncanakan hari ini'}
            </p>
          </div>
          <button
            type="button"
            className="btn btn--outline btn--sm"
            onClick={() => onNavigate('Planner')}
          >
            Detail <ArrowRight size={14} />
          </button>
        </div>

        <div className="home-summary-card__body">
          <CalorieRing consumed={totals.calories} goal={calorieGoal} />

          <div className="home-summary-stats">
            <div className="home-stat-item">
              <span className="home-stat-label">Target Kalori</span>
              <strong className="home-stat-value">
                <Flame size={15} className="calorie-flame-icon" /> {formatCalories(calorieGoal)}
              </strong>
            </div>
            <div className="home-stat-item">
              <span className="home-stat-label">Protein</span>
              <strong className="home-stat-value">{formatGrams(totals.protein)}</strong>
            </div>
            <div className="home-stat-item">
              <span className="home-stat-label">Karbohidrat</span>
              <strong className="home-stat-value">{formatGrams(totals.carbs)}</strong>
            </div>
            <div className="home-stat-item">
              <span className="home-stat-label">Lemak</span>
              <strong className="home-stat-value">{formatGrams(totals.fat)}</strong>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Category Shortcuts */}
      <section className="home-section">
        <div className="list-head">
          <h2>Kategori Cepat</h2>
          <button
            type="button"
            className="home-link-btn"
            onClick={() => onNavigate('Favorites')}
          >
            <Heart size={14} /> {favorites?.length || 0} Favorit
          </button>
        </div>

        <div className="home-category-grid">
          {quickCategories.map((cat) => {
            const IconComp = cat.icon
            return (
              <button
                key={cat.id}
                type="button"
                className="home-category-card"
                onClick={() => onNavigateToCatalog(cat.id)}
              >
                <div className="home-category-card__icon">
                  <IconComp size={20} />
                </div>
                <span>{cat.label}</span>
              </button>
            )
          })}
        </div>
      </section>

      {/* Featured / Recommended Meals */}
      <section className="home-section">
        <div className="list-head">
          <h2>Rekomendasi Menu</h2>
          <button
            type="button"
            className="home-link-btn"
            onClick={() => onNavigate('Foods')}
          >
            Lihat Semua <ArrowRight size={14} />
          </button>
        </div>

        <ul className="meal-grid">
          {featuredMeals.map((meal) => (
            <MealCard
              key={meal.id || meal.name}
              meal={meal}
              onSelect={(m) => onNavigate('Detail', m)}
              onAddToPlan={(m) =>
                onAddToPlan(m, (m.category || 'lunch').toLowerCase(), 1)
              }
            />
          ))}
        </ul>

        <div className="home-cta-bar">
          <div>
            <h3>Punya resep sehat sendiri?</h3>
            <p className="text-secondary">
              Tambahkan menu kustom lengkap dengan kalori dan makronutrisi.
            </p>
          </div>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => onNavigate('Create')}
          >
            <Plus size={16} /> Tambah Menu
          </button>
        </div>
      </section>
    </div>
  )
}
