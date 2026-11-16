/**
 * calorieUtils.js — Perhitungan & kalkulasi nutrisi harian untuk NutriPlan.
 */

export const DEFAULT_CALORIE_GOAL = 2000
export const DEFAULT_PROTEIN_GOAL = 120 // grams
export const DEFAULT_CARBS_GOAL = 250   // grams
export const DEFAULT_FAT_GOAL = 65      // grams

/**
 * Hitung total kalori dan makronutrisi dari daftar entri meal plan.
 * Tiap entri bisa memiliki relasi meal dan properti servings.
 */
export function calculatePlanTotals(planItems = []) {
  return planItems.reduce(
    (acc, item) => {
      const meal = item.meal || item
      const servings = Number(item.servings || 1)
      const cal = Number(meal.calories || 0) * servings
      const pro = Number(meal.protein || 0) * servings
      const crb = Number(meal.carbs || 0) * servings
      const fat = Number(meal.fat || 0) * servings

      return {
        calories: Math.round(acc.calories + cal),
        protein: Math.round((acc.protein + pro) * 10) / 10,
        carbs: Math.round((acc.carbs + crb) * 10) / 10,
        fat: Math.round((acc.fat + fat) * 10) / 10,
        count: acc.count + 1,
      }
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0, count: 0 },
  )
}

/**
 * Kelompokkan item meal plan berdasarkan jenis waktu makan (meal_type).
 */
export function groupPlanByMealType(planItems = []) {
  const groups = {
    breakfast: [],
    lunch: [],
    dinner: [],
    snack: [],
  }

  planItems.forEach((item) => {
    const type = (item.meal_type || item.category || 'lunch').toLowerCase()
    if (groups[type]) {
      groups[type].push(item)
    } else {
      groups.lunch.push(item)
    }
  })

  return groups
}

/**
 * Format kalori dengan satuan 'kkal'
 */
export function formatCalories(kcal) {
  const val = Number(kcal) || 0
  return `${val.toLocaleString('id-ID')} kkal`
}

/**
 * Format gram makronutrisi
 */
export function formatGrams(g) {
  const val = Number(g) || 0
  return `${val.toFixed(val % 1 === 0 ? 0 : 1)}g`
}

/**
 * Format tanggal Indonesia ramah pengguna (misal: "Senin, 16 Nov 2026")
 */
export function formatPlanDate(dateStr) {
  if (!dateStr) return 'Hari Ini'
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Kembalikan string tanggal hari ini dalam format YYYY-MM-DD
 */
export function getTodayDateString() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
