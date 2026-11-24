import { MealPlanModel } from '../models/mealPlanModel.js'

export const MealPlanController = {
  /**
   * GET /api/meal-plans?user_id=...&date=...
   */
  async getMealPlans(req, res) {
    try {
      const { user_id, date } = req.query

      if (!user_id || !date) {
        return res.status(400).json({
          success: false,
          message: 'Parameter user_id dan date wajib diisi.',
        })
      }

      const plans = await MealPlanModel.findByUserAndDate(user_id, date)
      return res.status(200).json({
        success: true,
        data: plans,
      })
    } catch (error) {
      console.error('[MealPlanController.getMealPlans]', error)
      return res.status(500).json({
        success: false,
        message: error.message || 'Gagal memuat meal plan.',
      })
    }
  },

  /**
   * POST /api/meal-plans
   */
  async createMealPlan(req, res) {
    try {
      const { user_id, date, meal_id, meal_type, servings } = req.body

      if (!user_id || !date || !meal_id) {
        return res.status(400).json({
          success: false,
          message: 'user_id, date, dan meal_id wajib diisi.',
        })
      }

      const created = await MealPlanModel.create({
        user_id,
        date,
        meal_id,
        meal_type,
        servings,
      })

      return res.status(201).json({
        success: true,
        data: created,
        message: 'Menu berhasil ditambahkan ke jadwal makan.',
      })
    } catch (error) {
      console.error('[MealPlanController.createMealPlan]', error)
      return res.status(500).json({
        success: false,
        message: error.message || 'Gagal menambahkan ke jadwal makan.',
      })
    }
  },

  /**
   * PATCH /api/meal-plans/:id
   */
  async updateServings(req, res) {
    try {
      const { id } = req.params
      const { servings } = req.body

      if (servings === undefined || Number(servings) <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Porsi harus lebih dari 0.',
        })
      }

      const updated = await MealPlanModel.updateServings(id, servings)
      return res.status(200).json({
        success: true,
        data: updated,
        message: 'Porsi berhasil diubah.',
      })
    } catch (error) {
      console.error('[MealPlanController.updateServings]', error)
      return res.status(500).json({
        success: false,
        message: error.message || 'Gagal mengubah porsi makanan.',
      })
    }
  },

  /**
   * DELETE /api/meal-plans/:id
   */
  async deleteMealPlan(req, res) {
    try {
      const { id } = req.params
      await MealPlanModel.delete(id)
      return res.status(200).json({
        success: true,
        message: 'Menu berhasil dihapus dari jadwal makan.',
      })
    } catch (error) {
      console.error('[MealPlanController.deleteMealPlan]', error)
      return res.status(500).json({
        success: false,
        message: error.message || 'Gagal menghapus dari jadwal makan.',
      })
    }
  },
}
