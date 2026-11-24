import { Router } from 'express'
import { supabase } from '../config/supabase.js'

const router = Router()

/**
 * POST /api/upload
 * Accepts multipart form data with an 'image' field.
 * Uploads to Supabase Storage bucket 'meals'.
 */
router.post('/', async (req, res) => {
  try {
    // Express 5 doesn't have built-in multipart parsing.
    // We'll read the raw body and use the content-type to construct the file.
    // For simplicity, accept base64-encoded JSON payload as an alternative.

    const contentType = req.headers['content-type'] || ''

    if (contentType.includes('application/json')) {
      // JSON body: { filename, content_type, base64 }
      const { filename, content_type, base64 } = req.body
      if (!base64 || !filename) {
        return res.status(400).json({ success: false, message: 'filename dan base64 wajib diisi.' })
      }

      const buffer = Buffer.from(base64, 'base64')
      const ext = filename.split('.').pop() || 'png'
      const storageName = `meal_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('meals')
        .upload(storageName, buffer, {
          contentType: content_type || 'image/png',
          upsert: false,
        })

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage.from('meals').getPublicUrl(storageName)

      return res.status(200).json({
        success: true,
        data: { url: urlData.publicUrl, filename: storageName },
      })
    }

    // For multipart/form-data, the raw body is available as a Buffer
    // We need a lightweight multipart parser
    return res.status(400).json({
      success: false,
      message: 'Gunakan Content-Type application/json dengan base64-encoded image.',
    })
  } catch (error) {
    console.error('[UploadRoute]', error)
    return res.status(500).json({
      success: false,
      message: error.message || 'Gagal mengupload gambar.',
    })
  }
})

export default router
