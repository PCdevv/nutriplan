import { apiClient } from '../config/api'
import MEALS_FALLBACK from '../data/meals'

// ---------------------------------------------------------------------------
// Normalizer — standardizes meal shape
// ---------------------------------------------------------------------------
export const normalizeMeal = (item) => {
  if (!item) return null

  // Resolve ingredients/specs
  let ingredientsList = []
  if (Array.isArray(item.ingredients)) {
    ingredientsList = item.ingredients
  } else if (Array.isArray(item.specs)) {
    ingredientsList = item.specs.map((s, idx) => {
      if (typeof s === 'string') {
        const colonIndex = s.indexOf(':')
        if (colonIndex > -1) {
          return {
            id: `ing-${idx}`,
            name: s.substring(0, colonIndex).trim(),
            quantity: s.substring(colonIndex + 1).trim(),
          }
        }
        return { id: `ing-${idx}`, name: s.trim(), quantity: 'Secukupnya' }
      }
      return s
    })
  }

  return {
    ...item,
    id: item.id,
    name: item.name || 'Menu Sehat',
    category: item.category || 'Lunch',
    calories: Number(item.calories ?? 0),
    protein: Number(item.protein ?? 0),
    carbs: Number(item.carbs ?? 0),
    fat: Number(item.fat ?? 0),
    serving_size: item.serving_size || '1 porsi',
    description: item.description || '',
    image_url: item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
    ingredients: ingredientsList,
  }
}

class MealService {
  /**
   * Fetch a list of meals with optional search and category filters.
   */
  async getMeals(params = {}) {
    try {
      const queryParams = new URLSearchParams()
      if (params.search) queryParams.set('search', params.search)
      if (params.category && params.category !== 'All') queryParams.set('category', params.category)
      if (params.sort_by) queryParams.set('sort_by', params.sort_by)
      if (params.order) queryParams.set('order', params.order)
      if (params.limit) queryParams.set('limit', params.limit)

      const qs = queryParams.toString()
      const res = await apiClient.get(`/api/meals${qs ? `?${qs}` : ''}`)

      const list = Array.isArray(res.data) ? res.data.map(normalizeMeal) : []
      return {
        success: true,
        data: list,
        pagination: {
          total: list.length,
          page: params.page || 1,
          limit: params.limit || 50,
        },
      }
    } catch (err) {
      console.warn('[mealService] API getMeals failed, fallback to local meals:', err.message)
      // Fallback filter locally
      let local = [...MEALS_FALLBACK]
      if (params.category && params.category !== 'All') {
        local = local.filter((m) => m.category.toLowerCase() === params.category.toLowerCase())
      }
      if (params.search) {
        const s = params.search.toLowerCase()
        local = local.filter((m) => m.name.toLowerCase().includes(s) || m.description.toLowerCase().includes(s))
      }
      return {
        success: true,
        data: local.map(normalizeMeal),
        isFallback: true,
      }
    }
  }

  /**
   * Fetch a single meal by ID.
   */
  async getMealById(id) {
    try {
      const res = await apiClient.get(`/api/meals/${id}`)
      if (res.data) {
        return { success: true, data: normalizeMeal(res.data) }
      }
    } catch (err) {
      console.warn('[mealService] getMealById failed:', err.message)
    }

    // Fallback search local
    const match = MEALS_FALLBACK.find((m) => String(m.id) === String(id))
    if (match) {
      return { success: true, data: normalizeMeal(match) }
    }
    throw new Error('Menu makanan tidak ditemukan.')
  }

  /**
   * Create a new meal item.
   */
  async createMeal(data) {
    try {
      const payload = {
        name: data.name,
        category: data.category || 'Lunch',
        calories: Number(data.calories || 0),
        protein: Number(data.protein || 0),
        carbs: Number(data.carbs || 0),
        fat: Number(data.fat || 0),
        serving_size: data.serving_size || '1 porsi',
        description: data.description || '',
        image_url: data.image_url || '',
      }

      const res = await apiClient.post('/api/meals', payload)
      return { success: true, data: normalizeMeal(res.data) }
    } catch (err) {
      console.warn('[mealService] createMeal failed:', err.message)
      // Offline mock
      const created = { ...data, id: `local-${Date.now()}` }
      return { success: true, data: normalizeMeal(created) }
    }
  }

  /**
   * Update existing meal.
   */
  async updateMeal(id, data) {
    try {
      const res = await apiClient.put(`/api/meals/${id}`, data)
      return { success: true, data: normalizeMeal(res.data) }
    } catch (err) {
      console.warn('[mealService] updateMeal failed:', err.message)
      return { success: true, data: normalizeMeal({ id, ...data }) }
    }
  }

  /**
   * Delete meal item.
   */
  async deleteMeal(id) {
    try {
      await apiClient.delete(`/api/meals/${id}`)
      return { success: true }
    } catch (err) {
      console.warn('[mealService] deleteMeal failed:', err.message)
      return { success: true }
    }
  }
}

export default new MealService()
