import { useState, useEffect, useCallback, useMemo } from 'react'
import mealPlanService from '../services/mealPlanService'
import { getUserIdentifier } from '../services/userService'
import {
  calculatePlanTotals,
  groupPlanByMealType,
  getTodayDateString,
} from '../utils/calorieUtils'

export function useMealPlan(initialDate = getTodayDateString()) {
  const [selectedDate, setSelectedDate] = useState(initialDate)
  const [planItems, setPlanItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const userIdentifier = getUserIdentifier()

  const fetchPlan = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await mealPlanService.getMealPlan(userIdentifier, selectedDate)
      if (res.success) {
        setPlanItems(res.data || [])
      } else {
        setError(res.message || 'Gagal memuat meal plan.')
      }
    } catch (err) {
      setError(err.message || 'Gagal memuat meal plan.')
      setPlanItems([])
    } finally {
      setLoading(false)
    }
  }, [userIdentifier, selectedDate])

  useEffect(() => {
    fetchPlan()
  }, [fetchPlan])

  // Calculated totals & groups
  const totals = useMemo(() => calculatePlanTotals(planItems), [planItems])
  const grouped = useMemo(() => groupPlanByMealType(planItems), [planItems])

  // Add a meal to current plan
  const addMealToPlan = async (meal, mealType = 'lunch', servings = 1) => {
    try {
      const payload = {
        user_id: userIdentifier,
        date: selectedDate,
        meal_id: meal.id,
        meal_type: mealType.toLowerCase(),
        servings: Number(servings) || 1,
        meal,
      }
      const res = await mealPlanService.addToMealPlan(payload)
      if (res.success) {
        await fetchPlan()
        return true
      }
    } catch (err) {
      setError(err.message || 'Gagal menambahkan menu ke meal plan.')
    }
    return false
  }

  // Remove meal from plan
  const removeFromPlan = async (planId) => {
    try {
      const res = await mealPlanService.removeFromMealPlan(planId)
      if (res.success) {
        setPlanItems((prev) => prev.filter((p) => String(p.id) !== String(planId)))
        return true
      }
    } catch (err) {
      setError(err.message || 'Gagal menghapus menu dari meal plan.')
    }
    return false
  }

  // Update servings
  const updateServings = async (planId, servings) => {
    try {
      const res = await mealPlanService.updateServings(planId, servings)
      if (res.success) {
        setPlanItems((prev) =>
          prev.map((p) =>
            String(p.id) === String(planId) ? { ...p, servings: Number(servings) } : p,
          ),
        )
        return true
      }
    } catch (err) {
      console.warn('Update servings failed:', err)
    }
    return false
  }

  // Duplicate meal plans from sourceDate to targetDate
  const duplicateMealPlan = async (sourceDate, targetDate, replace = false) => {
    try {
      setError(null)
      const res = await mealPlanService.duplicateMealPlan({
        user_id: userIdentifier,
        source_date: sourceDate,
        target_date: targetDate,
        replace,
      })
      if (res.success) {
        if (targetDate === selectedDate) {
          await fetchPlan()
        }
        return { success: true, data: res.data, message: res.message }
      }
      return { success: false, message: res.message || 'Gagal menduplikasi meal plan.' }
    } catch (err) {
      const msg = err.message || 'Gagal menduplikasi meal plan.'
      setError(msg)
      return { success: false, message: msg }
    }
  }

  return {
    selectedDate,
    setSelectedDate,
    planItems,
    totals,
    grouped,
    loading,
    error,
    refetch: fetchPlan,
    addMealToPlan,
    removeFromPlan,
    updateServings,
    duplicateMealPlan,
  }
}
