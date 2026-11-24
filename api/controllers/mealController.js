import { MealModel } from '../models/mealModel.js'

export const MealController = {
  /**
   * GET /api/meals
   */
  async getMeals(req, res) {
    try {
      const { search, category, sort_by, order, limit } = req.query
      const meals = await MealModel.findAll({ search, category, sort_by, order, limit })
      return res.status(200).json({
        success: true,
        data: meals,
      })
    } catch (error) {
      console.error('[MealController.getMeals]', error)
      return res.status(500).json({
        success: false,
        message: error.message || 'Gagal mengambil data makanan.',
      })
    }
  },

  /**
   * GET /api/meals/:id
   */
  async getMealById(req, res) {
    try {
      const { id } = req.params
      const meal = await MealModel.findById(id)
      if (!meal) {
        return res.status(404).json({
          success: false,
          message: 'Menu makanan tidak ditemukan.',
        })
      }
      return res.status(200).json({
        success: true,
        data: meal,
      })
    } catch (error) {
      console.error('[MealController.getMealById]', error)
      return res.status(500).json({
        success: false,
        message: error.message || 'Gagal memuat detail menu.',
      })
    }
  },

  /**
   * POST /api/meals
   */
  async createMeal(req, res) {
    try {
      const { name, category, calories, protein, carbs, fat, serving_size, description, image_url } = req.body

      if (!name || name.trim().length < 3) {
        return res.status(400).json({
          success: false,
          message: 'Nama makanan minimal 3 karakter.',
        })
      }

      const created = await MealModel.create({
        name: name.trim(),
        category,
        calories,
        protein,
        carbs,
        fat,
        serving_size,
        description,
        image_url,
      })

      return res.status(201).json({
        success: true,
        data: created,
        message: 'Menu berhasil ditambahkan.',
      })
    } catch (error) {
      console.error('[MealController.createMeal]', error)
      return res.status(500).json({
        success: false,
        message: error.message || 'Gagal membuat menu makanan.',
      })
    }
  },

  /**
   * PUT /api/meals/:id
   */
  async updateMeal(req, res) {
    try {
      const { id } = req.params
      const updated = await MealModel.update(id, req.body)
      return res.status(200).json({
        success: true,
        data: updated,
        message: 'Menu berhasil diperbarui.',
      })
    } catch (error) {
      console.error('[MealController.updateMeal]', error)
      return res.status(500).json({
        success: false,
        message: error.message || 'Gagal memperbarui menu makanan.',
      })
    }
  },

  /**
   * DELETE /api/meals/:id
   */
  async deleteMeal(req, res) {
    try {
      const { id } = req.params
      await MealModel.delete(id)
      return res.status(200).json({
        success: true,
        message: 'Menu berhasil dihapus.',
      })
    } catch (error) {
      console.error('[MealController.deleteMeal]', error)
      return res.status(500).json({
        success: false,
        message: error.message || 'Gagal menghapus menu makanan.',
      })
    }
  },
}
