import { apiClient, IS_SUPABASE } from '../config/api'
import { normalizeMeal } from './mealService'
import MEALS_FALLBACK from '../data/meals'

const OFFLINE_PLANS_KEY = 'nutriplan_offline_plans'

function getOfflinePlans() {
  try {
    const raw = localStorage.getItem(OFFLINE_PLANS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveOfflinePlans(plans) {
  try {
    localStorage.setItem(OFFLINE_PLANS_KEY, JSON.stringify(plans))
  } catch (err) {
    console.warn('[mealPlanService] LocalStorage quota exceeded:', err)
  }
}

class MealPlanService {
  /**
   * Get meal plans for a given user on a specific date.
   */
  async getMealPlan(userId, dateStr) {
    if (IS_SUPABASE) {
      try {
        const data = await apiClient.get(
          `/rest/v1/meal_plans?user_id=eq.${userId}&date=eq.${dateStr}&select=id,user_id,date,meal_type,servings,created_at,meal_id,meals(*)`,
        )

        const list = Array.isArray(data)
          ? data.map((item) => ({
              id: item.id,
              user_id: item.user_id,
              date: item.date,
              meal_type: item.meal_type,
              servings: Number(item.servings || 1),
              created_at: item.created_at,
              meal_id: item.meal_id,
              meal: item.meals ? normalizeMeal(item.meals) : null,
            }))
          : []

        return { success: true, data: list }
      } catch (err) {
        console.warn('[mealPlanService] Supabase getMealPlan failed, using offline cache:', err.message)
      }
    }

    // Offline fallback
    const offlineList = getOfflinePlans()
    const filtered = offlineList.filter(
      (p) => String(p.user_id) === String(userId) && p.date === dateStr,
    )

    // Resolve meal object for each offline entry
    const resolved = filtered.map((item) => {
      let mealObj = item.meal
      if (!mealObj) {
        const found = MEALS_FALLBACK.find((m) => String(m.id) === String(item.meal_id))
        mealObj = found ? normalizeMeal(found) : null
      }
      return {
        ...item,
        meal: mealObj,
      }
    })

    return { success: true, data: resolved, isOffline: true }
  }

  /**
   * Add a meal entry to user's plan.
   * @param {Object} data { user_id, date, meal_id, meal_type, servings, meal }
   */
  async addToMealPlan(data) {
    const payload = {
      user_id: data.user_id,
      date: data.date,
      meal_id: data.meal_id,
      meal_type: (data.meal_type || 'lunch').toLowerCase(),
      servings: Number(data.servings || 1),
    }

    // Save copy in offline cache
    const offlinePlans = getOfflinePlans()
    const offlineItem = {
      id: `local-plan-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      ...payload,
      created_at: new Date().toISOString(),
      meal: data.meal ? normalizeMeal(data.meal) : null,
    }
    offlinePlans.push(offlineItem)
    saveOfflinePlans(offlinePlans)

    if (IS_SUPABASE) {
      try {
        const res = await apiClient.post('/rest/v1/meal_plans', payload, {
          headers: { Prefer: 'return=representation' },
        })
        const created = Array.isArray(res) ? res[0] : res
        return {
          success: true,
          data: {
            ...created,
            meal: data.meal ? normalizeMeal(data.meal) : null,
          },
        }
      } catch (err) {
        console.warn('[mealPlanService] Supabase add failed, saved locally:', err.message)
      }
    }

    return { success: true, data: offlineItem }
  }

  /**
   * Remove an entry from meal plan.
   */
  async removeFromMealPlan(planId) {
    // Remove from offline cache
    const offlinePlans = getOfflinePlans().filter((p) => String(p.id) !== String(planId))
    saveOfflinePlans(offlinePlans)

    if (IS_SUPABASE && !String(planId).startsWith('local-plan-')) {
      try {
        await apiClient.delete(`/rest/v1/meal_plans?id=eq.${planId}`)
        return { success: true }
      } catch (err) {
        console.warn('[mealPlanService] Supabase delete failed:', err.message)
      }
    }

    return { success: true }
  }

  /**
   * Update servings of an entry
   */
  async updateServings(planId, servings) {
    const val = Number(servings) || 1
    const offlinePlans = getOfflinePlans().map((p) =>
      String(p.id) === String(planId) ? { ...p, servings: val } : p,
    )
    saveOfflinePlans(offlinePlans)

    if (IS_SUPABASE && !String(planId).startsWith('local-plan-')) {
      try {
        await apiClient.patch(
          `/rest/v1/meal_plans?id=eq.${planId}`,
          { servings: val },
          { headers: { Prefer: 'return=representation' } },
        )
      } catch (err) {
        console.warn('[mealPlanService] updateServings failed:', err.message)
      }
    }

    return { success: true }
  }
}

export default new MealPlanService()
