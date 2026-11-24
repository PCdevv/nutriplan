import { FavoriteModel } from '../models/favoriteModel.js'

export const FavoriteController = {
  /**
   * GET /api/favorites?user_id=...
   */
  async getFavorites(req, res) {
    try {
      const { user_id } = req.query

      if (!user_id) {
        return res.status(400).json({
          success: false,
          message: 'Parameter user_id wajib diisi.',
        })
      }

      const favorites = await FavoriteModel.findByUser(user_id)
      return res.status(200).json({
        success: true,
        data: favorites,
      })
    } catch (error) {
      console.error('[FavoriteController.getFavorites]', error)
      return res.status(500).json({
        success: false,
        message: error.message || 'Gagal memuat daftar favorit.',
      })
    }
  },

  /**
   * POST /api/favorites/toggle
   */
  async toggleFavorite(req, res) {
    try {
      const { user_id, meal_id } = req.body

      if (!user_id || !meal_id) {
        return res.status(400).json({
          success: false,
          message: 'user_id dan meal_id wajib disertakan.',
        })
      }

      const result = await FavoriteModel.toggle(user_id, meal_id)
      return res.status(200).json({
        success: true,
        data: result,
      })
    } catch (error) {
      console.error('[FavoriteController.toggleFavorite]', error)
      return res.status(500).json({
        success: false,
        message: error.message || 'Gagal mengubah status favorit.',
      })
    }
  },
}
