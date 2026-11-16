import { useMemo } from 'react'
import { Heart, Loader, AlertCircle, ArrowRight } from 'lucide-react'
import { useFavorites } from '../hooks/useFavorites'
import { useMeals } from '../hooks/useMeals'
import MEALS_LOCAL from '../data/meals'
import MealCard from '../components/meal/MealCard'

/**
 * FavoritesPage — Displays user's saved/bookmarked meals.
 */
export default function FavoritesPage({ onSelectMeal, onNavigateCatalog, onAddToPlan }) {
  const { favorites, loading: favLoading, error: favError, refetch } = useFavorites()
  const { meals: apiMeals } = useMeals({ limit: 100 })

  // All known meals lookup
  const allKnownMeals = useMemo(() => {
    const map = new Map()
    MEALS_LOCAL.forEach((m) => {
      map.set(m.id, m)
      map.set(String(m.id), m)
      if (m.name) map.set(m.name, m)
    })
    apiMeals.forEach((m) => {
      if (m.id !== undefined && m.id !== null) {
        map.set(m.id, m)
        map.set(String(m.id), m)
      }
      if (m.name) map.set(m.name, m)
    })
    return map
  }, [apiMeals])

  // Resolve favorite objects
  const favoriteItems = useMemo(() => {
    const resolved = []
    const seen = new Set()

    favorites.forEach((fav) => {
      const id = fav.id || fav.meal_id
      const match = allKnownMeals.get(id) || allKnownMeals.get(fav.name) || (fav.name ? fav : null)
      if (match && !seen.has(match.id || match.name)) {
        seen.add(match.id || match.name)
        resolved.push(match)
      } else if (id && !seen.has(id)) {
        seen.add(id)
        resolved.push({
          id,
          name: fav.name || 'Menu Favorit',
          category: fav.category || 'Lunch',
          calories: fav.calories || 300,
          protein: fav.protein || 15,
          carbs: fav.carbs || 30,
          fat: fav.fat || 10,
        })
      }
    })

    return resolved
  }, [favorites, allKnownMeals])

  const isLoading = favLoading && favoriteItems.length === 0

  return (
    <div className="fav-page">
      <section className="masthead">
        <h1 className="display">Menu Favorit</h1>
        <p className="lede">
          Koleksi hidangan kesukaan Anda untuk mempermudah perencanaan makan harian.
        </p>
      </section>

      <section className="fav-content">
        <div className="list-head">
          <h2>Disimpan</h2>
          <span className="count">
            {favoriteItems.length} menu tersimpan
          </span>
        </div>

        {isLoading && (
          <div className="state-box">
            <Loader size={28} className="spin text-primary" />
            <p>Memuat daftar favorit…</p>
          </div>
        )}

        {!isLoading && favError && favoriteItems.length === 0 && (
          <div className="state-box state-box--error">
            <AlertCircle size={28} />
            <p>{favError}</p>
            <button type="button" className="btn btn--outline" onClick={refetch}>
              Muat Ulang
            </button>
          </div>
        )}

        {!isLoading && favoriteItems.length === 0 && !favError && (
          <div className="state-box">
            <Heart size={42} className="text-secondary" />
            <h3>Belum ada menu favorit</h3>
            <p className="lede">
              Jelajahi katalog dan tekan ikon hati pada hidangan yang Anda sukai untuk menyimpannya di sini.
            </p>
            {onNavigateCatalog && (
              <button
                type="button"
                className="btn btn--primary"
                onClick={onNavigateCatalog}
                style={{ marginTop: '16px' }}
              >
                Jelajahi Katalog <ArrowRight size={16} />
              </button>
            )}
          </div>
        )}

        {favoriteItems.length > 0 && (
          <ul className="meal-grid">
            {favoriteItems.map((meal) => (
              <MealCard
                key={meal.id || meal.name}
                meal={meal}
                onSelect={onSelectMeal}
                onAddToPlan={onAddToPlan ? () => onAddToPlan(meal) : undefined}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
