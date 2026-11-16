import { useState, useEffect, useCallback } from 'react'
import mealService from '../services/mealService'

/**
 * useMeals — fetch the list of meals from Supabase or local fallback.
 */
export function useMeals(params = {}) {
  const [meals, setMeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState(null)

  const paramKey = JSON.stringify(params)

  const fetchMeals = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await mealService.getMeals(params)

      if (response.success) {
        setMeals(response.data || [])
        setPagination(response.pagination || null)
      } else {
        setError(response.message || 'Gagal mengambil data menu makanan.')
      }
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan saat memuat menu makanan.')
      setMeals([])
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramKey])

  useEffect(() => {
    fetchMeals()
  }, [fetchMeals])

  return { meals, loading, error, pagination, refetch: fetchMeals }
}

/**
 * useMealById — fetch a single meal by ID.
 */
export function useMealById(id) {
  const [meal, setMeal] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchMeal = useCallback(async () => {
    if (!id) {
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      setError(null)

      const response = await mealService.getMealById(id)
      if (response.success) {
        setMeal(response.data)
      } else {
        setError(response.message || 'Menu makanan tidak ditemukan.')
      }
    } catch (err) {
      setError(err.message || 'Gagal memuat detail menu makanan.')
      setMeal(null)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchMeal()
  }, [fetchMeal])

  return { meal, loading, error, refetch: fetchMeal }
}
