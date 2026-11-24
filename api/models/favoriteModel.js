import { supabase } from '../config/supabase.js'

export const FavoriteModel = {
  /**
   * Mengambil daftar makanan favorit user
   */
  async findByUser(userId) {
    const { data, error } = await supabase
      .from('favorites')
      .select('id, user_id, meal_id, created_at, meals(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  /**
   * Toggle status favorit (tambah jika belum ada, hapus jika sudah ada)
   */
  async toggle(userId, mealId) {
    const targetMealId = Number(mealId)

    // Cek apakah sudah ada di favorit
    const { data: existing, error: checkError } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('meal_id', targetMealId)

    if (checkError) throw checkError

    if (existing && existing.length > 0) {
      // Hapus dari favorit
      const { error: deleteError } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('meal_id', targetMealId)

      if (deleteError) throw deleteError
      return { is_favorited: false, meal_id: targetMealId }
    } else {
      // Tambahkan ke favorit
      const { data: inserted, error: insertError } = await supabase
        .from('favorites')
        .insert([{ user_id: userId, meal_id: targetMealId }])
        .select()
        .single()

      if (insertError) throw insertError
      return { is_favorited: true, meal_id: targetMealId, data: inserted }
    }
  },
}
