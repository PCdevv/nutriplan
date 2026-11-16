import { apiClient, IS_SUPABASE } from '../config/api'
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
    if (IS_SUPABASE) {
      const queryParts = ['select=*']

      if (params.search) {
        queryParts.push(`name=ilike.*${encodeURIComponent(params.search)}*`)
      }

      if (params.category && params.category !== 'All') {
        queryParts.push(`category=eq.${encodeURIComponent(params.category)}`)
      }

      if (params.sort_by) {
        const order = params.order === 'desc' ? 'desc' : 'asc'
        queryParts.push(`order=${encodeURIComponent(params.sort_by)}.${order}`)
      } else {
        queryParts.push('order=created_at.desc')
      }

      if (params.limit) {
        queryParts.push(`limit=${params.limit}`)
      }

      const queryString = queryParts.join('&')
      try {
        const data = await apiClient.get(`/rest/v1/meals?${queryString}`)
        const list = Array.isArray(data) ? data.map(normalizeMeal) : []

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
        console.warn('[mealService] Supabase getMeals failed, fallback to local meals:', err.message)
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

    // Default local data
    return { success: true, data: MEALS_FALLBACK.map(normalizeMeal) }
  }

  /**
   * Fetch a single meal by ID.
   */
  async getMealById(id) {
    if (IS_SUPABASE) {
      try {
        const data = await apiClient.get(`/rest/v1/meals?id=eq.${id}&select=*`)
        if (Array.isArray(data) && data.length > 0) {
          return { success: true, data: normalizeMeal(data[0]) }
        }
      } catch (err) {
        console.warn('[mealService] getMealById failed on Supabase:', err.message)
      }
    }

    // Fallback search local
    const match = MEALS_FALLBACK.find((m) => String(m.id) === String(id))
    if (match) {
      return { success: true, data: normalizeMeal(match) }
    }
    throw new Error('Menu makanan tidak ditemukan.')
  }

  /**
   * Create a new meal item in the database.
   */
  async createMeal(data) {
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

    if (IS_SUPABASE) {
      const res = await apiClient.post('/rest/v1/meals', payload, {
        headers: { Prefer: 'return=representation' },
      })
      const created = Array.isArray(res) ? res[0] : res
      return { success: true, data: normalizeMeal(created) }
    }

    // Offline mock
    const created = { ...payload, id: `local-${Date.now()}` }
    return { success: true, data: normalizeMeal(created) }
  }

  /**
   * Update existing meal.
   */
  async updateMeal(id, data) {
    const payload = {
      updated_at: new Date().toISOString(),
      ...(data.name !== undefined && { name: data.name }),
      ...(data.category !== undefined && { category: data.category }),
      ...(data.calories !== undefined && { calories: Number(data.calories) }),
      ...(data.protein !== undefined && { protein: Number(data.protein) }),
      ...(data.carbs !== undefined && { carbs: Number(data.carbs) }),
      ...(data.fat !== undefined && { fat: Number(data.fat) }),
      ...(data.serving_size !== undefined && { serving_size: data.serving_size }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.image_url !== undefined && { image_url: data.image_url }),
    }

    if (IS_SUPABASE) {
      const res = await apiClient.patch(`/rest/v1/meals?id=eq.${id}`, payload, {
        headers: { Prefer: 'return=representation' },
      })
      const updated = Array.isArray(res) ? res[0] : res
      return { success: true, data: normalizeMeal(updated) }
    }

    return { success: true, data: normalizeMeal({ id, ...payload }) }
  }

  /**
   * Delete meal item.
   */
  async deleteMeal(id) {
    if (IS_SUPABASE) {
      await apiClient.delete(`/rest/v1/meals?id=eq.${id}`)
      return { success: true }
    }
    return { success: true }
  }
}

export default new MealService()
