import { supabase } from '../config/supabase.js'

export const MealModel = {
  /**
   * Mengambil daftar makanan dengan filter dan sorting
   */
  async findAll({ search, category, sort_by = 'created_at', order = 'desc', limit = 100 }) {
    let query = supabase.from('meals').select('*')

    if (search) {
      query = query.ilike('name', `%${search}%`)
    }

    if (category && category !== 'All') {
      query = query.eq('category', category)
    }

    const isAscending = order.toLowerCase() === 'asc'
    query = query.order(sort_by, { ascending: isAscending })

    if (limit) {
      query = query.limit(Number(limit))
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  },

  /**
   * Mengambil satu makanan berdasarkan ID
   */
  async findById(id) {
    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  /**
   * Membuat makanan baru
   */
  async create(mealData) {
    const payload = {
      name: mealData.name,
      category: mealData.category || 'Lunch',
      calories: Number(mealData.calories || 0),
      protein: Number(mealData.protein || 0),
      carbs: Number(mealData.carbs || 0),
      fat: Number(mealData.fat || 0),
      serving_size: mealData.serving_size || '1 porsi',
      description: mealData.description || '',
      image_url: mealData.image_url || '',
    }

    const { data, error } = await supabase
      .from('meals')
      .insert([payload])
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Memperbarui makanan
   */
  async update(id, mealData) {
    const payload = {
      updated_at: new Date().toISOString(),
      ...(mealData.name !== undefined && { name: mealData.name }),
      ...(mealData.category !== undefined && { category: mealData.category }),
      ...(mealData.calories !== undefined && { calories: Number(mealData.calories) }),
      ...(mealData.protein !== undefined && { protein: Number(mealData.protein) }),
      ...(mealData.carbs !== undefined && { carbs: Number(mealData.carbs) }),
      ...(mealData.fat !== undefined && { fat: Number(mealData.fat) }),
      ...(mealData.serving_size !== undefined && { serving_size: mealData.serving_size }),
      ...(mealData.description !== undefined && { description: mealData.description }),
      ...(mealData.image_url !== undefined && { image_url: mealData.image_url }),
    }

    const { data, error } = await supabase
      .from('meals')
      .update(payload)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Menghapus makanan berdasarkan ID
   */
  async delete(id) {
    const { data, error } = await supabase
      .from('meals')
      .delete()
      .eq('id', id)

    if (error) throw error
    return data
  },
}
