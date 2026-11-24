import axios from 'axios'
import { API_BASE } from '../config/api'

// ---------------------------------------------------------------------------
// UploadService — image upload for meals.
// Uploads via Express API endpoint /api/upload with automatic
// client-side Base64 Data URL fallback.
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

    // --- Upload via Express API ---
    try {
      const formData = new FormData()
      formData.append('image', file)

      const response = await axios.post(`${API_BASE}/api/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000,
      })

      return {
        success: true,
        data: { url: response.data.data.url, filename: response.data.data.filename },
      }
    } catch (err) {
      console.warn('[uploadService] API upload failed, using Base64 Data URL fallback:', err.message)
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
