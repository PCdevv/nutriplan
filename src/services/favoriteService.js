import { apiClient, IS_SUPABASE } from '../config/api'
import { normalizeMeal } from './mealService'
import MEALS_FALLBACK from '../data/meals'

const LOCAL_KEY = 'nutriplan_favorites'

const readLocalFavs = () => {
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

const writeLocalFavs = (items) => {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(items))
  } catch {
    /* quota exceeded */
  }
}

class FavoriteService {
  /**
   * Retrieve all favourited meals for the given user.
   */
  async getFavorites(userIdentifier) {
    if (IS_SUPABASE) {
      try {
        const data = await apiClient.get(
          `/rest/v1/favorites?user_id=eq.${userIdentifier}&select=meal_id,created_at,meals(*)`,
        )
        const list = Array.isArray(data)
          ? data.map((fav) => {
              const meal = fav.meals ? normalizeMeal(fav.meals) : null
              return {
                ...(meal || {}),
                id: fav.meal_id,
                meal_id: fav.meal_id,
                created_at: fav.created_at,
              }
            })
          : []

        return { success: true, data: list }
      } catch (err) {
        console.warn('[favoriteService] Supabase getFavorites failed, fallback to local:', err.message)
      }
    }

    // LocalStorage fallback
    const localIds = readLocalFavs()
    const resolved = localIds.map((id) => {
      const found = MEALS_FALLBACK.find((m) => String(m.id) === String(id))
      return found ? normalizeMeal(found) : { id, meal_id: id, name: 'Menu Favorit' }
    })

    return { success: true, data: resolved, isLocal: true }
  }

  /**
   * Toggle a meal's favourite state (add ↔ remove).
   */
  async toggleFavorite(data) {
    const targetId = data.meal_id || data.id
    const userId = data.user_identifier

    // Always update local cache
    const current = readLocalFavs()
    const idx = current.findIndex((id) => String(id) === String(targetId))
    let isFavorited

    if (idx === -1) {
      current.push(targetId)
      isFavorited = true
    } else {
      current.splice(idx, 1)
      isFavorited = false
    }
    writeLocalFavs(current)

    if (IS_SUPABASE) {
      try {
        // Check if already favorited in Supabase
        const existing = await apiClient.get(
          `/rest/v1/favorites?meal_id=eq.${targetId}&user_id=eq.${userId}&select=*`,
        )

        if (Array.isArray(existing) && existing.length > 0) {
          await apiClient.delete(
            `/rest/v1/favorites?meal_id=eq.${targetId}&user_id=eq.${userId}`,
          )
          return { success: true, data: { is_favorited: false } }
        } else {
          await apiClient.post(
            '/rest/v1/favorites',
            { meal_id: targetId, user_id: userId },
            { headers: { Prefer: 'return=minimal' } },
          )
          return { success: true, data: { is_favorited: true } }
        }
      } catch (err) {
        console.warn('[favoriteService] Supabase toggle failed, saved locally:', err.message)
      }
    }

    return { success: true, data: { is_favorited: isFavorited } }
  }
}

export default new FavoriteService()
