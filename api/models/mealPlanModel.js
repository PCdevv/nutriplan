import { supabase } from '../config/supabase.js'

export const MealPlanModel = {
  /**
   * Mengambil meal plan user berdasarkan tanggal tertentu
   */
  async findByUserAndDate(userId, dateStr) {
    const { data, error } = await supabase
      .from('meal_plans')
      .select('id, user_id, date, meal_type, servings, created_at, meal_id, meals(*)')
      .eq('user_id', userId)
      .eq('date', dateStr)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data || []
  },

  /**
   * Menambahkan entri ke meal plan
   */
  async create(planData) {
    const payload = {
      user_id: planData.user_id,
      date: planData.date,
      meal_id: planData.meal_id,
      meal_type: (planData.meal_type || 'lunch').toLowerCase(),
      servings: Number(planData.servings || 1),
    }

    const { data, error } = await supabase
      .from('meal_plans')
      .insert([payload])
      .select('id, user_id, date, meal_type, servings, created_at, meal_id, meals(*)')
      .single()

    if (error) throw error
    return data
  },

  /**
   * Mengubah jumlah porsi (servings)
   */
  async updateServings(id, servings) {
    const { data, error } = await supabase
      .from('meal_plans')
      .update({ servings: Number(servings) })
      .eq('id', id)
      .select('id, user_id, date, meal_type, servings, created_at, meal_id, meals(*)')
      .single()

    if (error) throw error
    return data
  },

  /**
   * Menghapus entri dari meal plan
   */
  async delete(id) {
    const { data, error } = await supabase
      .from('meal_plans')
      .delete()
      .eq('id', id)

    if (error) throw error
    return data
  },
}
