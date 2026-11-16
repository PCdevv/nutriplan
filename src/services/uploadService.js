import axios from 'axios'
import { BASE_URL, SUPABASE_KEY, IS_SUPABASE } from '../config/api'

// ---------------------------------------------------------------------------
// UploadService — image upload for meals.
// Supports Supabase Storage (/storage/v1/object/:bucket/:file)
// with automatic client-side Base64 Data URL fallback.
// ---------------------------------------------------------------------------

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB

class UploadService {
  /**
   * Upload a meal image file.
   * @param {File} file
   * @returns {Promise<{ success: boolean, data: { url: string } }>}
   */
  async uploadImage(file) {
    if (!file) {
      throw new Error('Tidak ada file gambar yang dipilih.')
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new Error('Format gambar tidak didukung. Gunakan JPG, PNG, atau WebP.')
    }
    if (file.size > MAX_SIZE_BYTES) {
      throw new Error('Ukuran file maksimal 5 MB.')
    }

    // --- Supabase Storage flow ---
    if (IS_SUPABASE) {
      const ext = file.name.split('.').pop() || 'png'
      const fileName = `meal_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`
      const bucketName = 'meals'

      try {
        const uploadUrl = `${BASE_URL}/storage/v1/object/${bucketName}/${fileName}`
        await axios.post(uploadUrl, file, {
          headers: {
            'Content-Type': file.type,
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
          },
          timeout: 30000,
        })

        const publicUrl = `${BASE_URL}/storage/v1/object/public/${bucketName}/${fileName}`
        return {
          success: true,
          data: { url: publicUrl, filename: fileName },
        }
      } catch (err) {
        console.warn('[uploadService] Supabase bucket not accessible, using Base64 Data URL fallback:', err.message)
      }
    }

    // Client-side fallback to base64 Data URL so user can always see & save their photo
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

    return {
      success: true,
      data: { url: dataUrl, filename: file.name },
    }
  }
}

export default new UploadService()
