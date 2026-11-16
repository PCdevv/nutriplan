import { useState, useEffect, useCallback } from 'react'
import favoriteService from '../services/favoriteService'
import { getUserIdentifier } from '../services/userService'

export function useFavorites() {
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isLocal, setIsLocal] = useState(false)
  const userIdentifier = getUserIdentifier()

  const fetchFavorites = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await favoriteService.getFavorites(userIdentifier)

      if (response.success) {
        setFavorites(response.data || [])
        setIsLocal(Boolean(response.isLocal))
      } else {
        throw new Error(response.message)
      }
    } catch {
      setFavorites([])
      setIsLocal(true)
    } finally {
      setLoading(false)
    }
  }, [userIdentifier])

  useEffect(() => {
    fetchFavorites()
  }, [fetchFavorites])

  return { favorites, loading, error, isLocal, refetch: fetchFavorites }
}

export function useToggleFavorite() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const userIdentifier = getUserIdentifier()

  const toggleFavorite = async (mealId) => {
    try {
      setLoading(true)
      setError(null)

      const response = await favoriteService.toggleFavorite({
        meal_id: mealId,
        user_identifier: userIdentifier,
      })

      if (response.success) {
        return response.data
      }
      throw new Error(response.message)
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  return { toggleFavorite, loading, error }
}

export function useIsFavorited(mealId) {
  const { favorites, loading: fetchLoading, refetch } = useFavorites()
  const { toggleFavorite: toggle, loading: toggleLoading } = useToggleFavorite()

  const isFavorited = favorites.some((fav) => {
    const favId = typeof fav === 'object' && fav !== null ? (fav.id ?? fav.meal_id) : fav
    return String(favId) === String(mealId)
  })

  const toggleFavorite = async () => {
    const result = await toggle(mealId)
    if (result) await refetch()
    return result
  }

  return {
    isFavorited,
    loading: fetchLoading || toggleLoading,
    toggleFavorite,
  }
}
