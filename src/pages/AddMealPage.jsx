import { useState, useEffect, useCallback } from 'react'
import {
  ArrowLeft,
  Upload,
  X,
  Plus,
  Loader,
  Save,
  CheckCircle,
  AlertCircle,
  Flame,
} from 'lucide-react'
import mealService from '../services/mealService'
import uploadService from '../services/uploadService'
import {
  saveDraft,
  loadDraft,
  deleteDraft,
  hasDraft,
  getDraftTimestamp,
  formatDraftTime,
} from '../utils/draftStorage'
import ConfirmModal from '../components/modals/ConfirmModal'

/**
 * AddMealPage — Create a new meal with image upload, nutrition facts, and draft persistence.
 */
export default function AddMealPage({ onBack, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Lunch',
    calories: 350,
    protein: 20,
    carbs: 45,
    fat: 10,
    serving_size: '1 porsi (250g)',
    description: '',
  })

  const [imagePreview, setImagePreview] = useState(null)
  const [uploadedImageUrl, setUploadedImageUrl] = useState('')

  // Ingredients list
  const [ingredients, setIngredients] = useState([
    { name: 'Bahan Utama', quantity: '150g' },
    { name: 'Sayuran / Pelengkap', quantity: 'Secukupnya' },
  ])

  const [uploading, setUploading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Draft modal
  const [showDraftModal, setShowDraftModal] = useState(() => hasDraft('create'))
  const [draftTimestamp, setDraftTimestamp] = useState(() => getDraftTimestamp('create'))

  const handleSaveDraft = useCallback((notify = true) => {
    const draftData = {
      formData,
      ingredients,
      uploadedImageUrl: uploadedImageUrl || imagePreview,
    }
    const saved = saveDraft(draftData, 'create')
    if (saved) {
      const ts = getDraftTimestamp('create')
      setDraftTimestamp(ts)
      if (notify) {
        setSuccessMsg(`Draf disimpan (${formatDraftTime(ts)})`)
        setTimeout(() => setSuccessMsg(''), 3000)
      }
    }
  }, [formData, ingredients, uploadedImageUrl, imagePreview])

  // Auto-save every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      handleSaveDraft(false)
    }, 30000)
    return () => clearInterval(interval)
  }, [handleSaveDraft])

  const handleLoadDraft = () => {
    const draft = loadDraft('create')
    if (draft) {
      if (draft.formData) setFormData(draft.formData)
      if (draft.ingredients) setIngredients(draft.ingredients)
      if (draft.uploadedImageUrl) {
        setUploadedImageUrl(draft.uploadedImageUrl)
        setImagePreview(draft.uploadedImageUrl)
      }
      setShowDraftModal(false)
      setSuccessMsg('Draf berhasil dipulihkan.')
      setTimeout(() => setSuccessMsg(''), 3500)
    }
  }

  const handleDiscardDraft = () => {
    deleteDraft('create')
    setShowDraftModal(false)
    setDraftTimestamp(null)
  }

  // File upload
  const handleImageChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setError('Ukuran gambar maksimal 5MB.')
      return
    }

    setImageFile(file)
    const localUrl = URL.createObjectURL(file)
    setImagePreview(localUrl)
    setError('')

    // Auto-upload in background
    try {
      setUploading(true)
      const res = await uploadService.uploadImage(file)
      if (res.success && res.data?.url) {
        setUploadedImageUrl(res.data.url)
      }
    } catch {
      // Fallback preview
      setUploadedImageUrl(localUrl)
    } finally {
      setUploading(false)
    }
  }

  const handleSelectPreset = (url) => {
    setImageFile(null)
    setImagePreview(url)
    setUploadedImageUrl(url)
    setError('')
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Ingredients handlers
  const handleIngredientChange = (index, field, value) => {
    setIngredients((prev) => {
      const copy = [...prev]
      copy[index] = { ...copy[index], [field]: value }
      return copy
    })
  }

  const addIngredient = () => {
    setIngredients((prev) => [...prev, { name: '', quantity: '' }])
  }

  const removeIngredient = (index) => {
    if (ingredients.length <= 1) return
    setIngredients((prev) => prev.filter((_, i) => i !== index))
  }

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.name.trim() || formData.name.trim().length < 3) {
      setError('Nama menu minimal 3 karakter.')
      return
    }

    const cleanIngredients = ingredients
      .filter((ing) => ing.name.trim())
      .map((ing) => ({
        name: ing.name.trim(),
        quantity: ing.quantity.trim() || 'Secukupnya',
      }))

    const payload = {
      name: formData.name.trim(),
      category: formData.category || 'Lunch',
      calories: Number(formData.calories) || 0,
      protein: Number(formData.protein) || 0,
      carbs: Number(formData.carbs) || 0,
      fat: Number(formData.fat) || 0,
      serving_size: formData.serving_size.trim() || '1 porsi',
      description: formData.description.trim(),
      image_url:
        uploadedImageUrl ||
        imagePreview ||
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
      ingredients: cleanIngredients,
    }

    try {
      setCreating(true)
      const res = await mealService.createMeal(payload)
      if (res.success || res.data) {
        deleteDraft('create')
        if (onSuccess) {
          onSuccess(res.data)
        } else if (onBack) {
          onBack()
        }
      } else {
        throw new Error(res.message || 'Gagal menyimpan menu makanan.')
      }
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan saat menyimpan menu.')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="form-page">
      {/* Top action bar */}
      <div className="form-head">
        <button type="button" className="detail-back" onClick={onBack}>
          <ArrowLeft size={18} /> Kembali ke Katalog
        </button>
        <button
          type="button"
          className="btn btn--outline btn--sm"
          onClick={() => handleSaveDraft(true)}
          title="Simpan draf"
        >
          <Save size={14} /> Simpan Draf
        </button>
      </div>

      <div className="form-title-group">
        <h1 className="display">Tambah Menu Baru</h1>
        <p className="lede">
          Masukkan hidangan baru ke katalog nutrisi Anda beserta kandungan kalori dan makronya.
        </p>
      </div>

      {/* Notifications */}
      {error && (
        <div className="toast toast--error">
          <AlertCircle size={18} /> {error}
        </div>
      )}
      {successMsg && (
        <div className="toast toast--success">
          <CheckCircle size={18} /> {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="entry-form">
        {/* Photo Upload Section */}
        <div className="card-box">
          <h2 className="card-box-title">Foto Makanan</h2>
          <p className="card-box-desc">
            Unggah foto sajian (maks 5MB) atau gunakan pilihan preset di bawah.
          </p>

          <div className="meal-photo-uploader">
            {imagePreview ? (
              <div className="preview-image-wrap">
                <img src={imagePreview} alt="Preview sajian" className="preview-img" />
                <button
                  type="button"
                  className="preview-remove-btn"
                  onClick={() => {
                    setImageFile(null)
                    setImagePreview(null)
                    setUploadedImageUrl('')
                  }}
                  title="Hapus foto"
                >
                  <X size={18} />
                </button>
              </div>
            ) : (
              <div className="upload-dropzone">
                <input
                  id="meal-photo-input"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="hidden-file-input"
                />
                <label htmlFor="meal-photo-input" className="upload-label">
                  {uploading ? (
                    <Loader size={36} className="spin text-primary" />
                  ) : (
                    <Upload size={36} className="upload-icon" />
                  )}
                  <span className="upload-main-text">
                    {uploading ? 'Mengunggah foto…' : 'Pilih Foto dari Galeri'}
                  </span>
                  <span className="upload-sub-text">Mendukung format JPG, PNG, atau WebP</span>
                </label>
              </div>
            )}

            {/* Presets */}
            <div className="preset-selector">
              <span className="preset-title">Atau gunakan foto preset:</span>
              <div className="preset-pills">
                <button
                  type="button"
                  className="pill"
                  onClick={() =>
                    handleSelectPreset(
                      'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80',
                    )
                  }
                >
                  🍛 Nasi Goreng
                </button>
                <button
                  type="button"
                  className="pill"
                  onClick={() =>
                    handleSelectPreset(
                      'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
                    )
                  }
                >
                  🥗 Salad Segar
                </button>
                <button
                  type="button"
                  className="pill"
                  onClick={() =>
                    handleSelectPreset(
                      'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=600&q=80',
                    )
                  }
                >
                  🍗 Ayam Panggang
                </button>
                <button
                  type="button"
                  className="pill"
                  onClick={() =>
                    handleSelectPreset(
                      'https://images.unsplash.com/photo-1584776296944-ab6fb57b0bdd?auto=format&fit=crop&w=600&q=80',
                    )
                  }
                >
                  🥣 Oatmeal
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Basic Details */}
        <div className="card-box">
          <h2 className="card-box-title">Informasi Utama</h2>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="meal-name" className="form-label">
                Nama Makanan / Minuman <span className="req">*</span>
              </label>
              <input
                id="meal-name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                placeholder="Misal: Nasi Timbel Komplit, Smoothie Berry..."
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="meal-cat" className="form-label">
                Kategori Waktu Makan <span className="req">*</span>
              </label>
              <select
                id="meal-cat"
                name="category"
                value={formData.category}
                onChange={handleFormChange}
                className="form-select"
              >
                <option value="Breakfast">Sarapan (Breakfast)</option>
                <option value="Lunch">Makan Siang (Lunch)</option>
                <option value="Dinner">Makan Malam (Dinner)</option>
                <option value="Snack">Cemilan (Snack)</option>
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '16px' }}>
            <label htmlFor="meal-serving" className="form-label">
              Ukuran Porsi Standar
            </label>
            <input
              id="meal-serving"
              type="text"
              name="serving_size"
              value={formData.serving_size}
              onChange={handleFormChange}
              placeholder="Contoh: 1 piring (250g), 1 mangkuk, 1 potong sedang"
              className="form-input"
            />
          </div>
        </div>

        {/* Nutrition Facts */}
        <div className="card-box">
          <div className="card-box-head-with-icon">
            <Flame size={20} className="text-primary" />
            <h2 className="card-box-title" style={{ margin: 0 }}>
              Kandungan Nutrisi per Porsi
            </h2>
          </div>

          <div className="form-grid form-grid--4" style={{ marginTop: '16px' }}>
            <div className="form-group">
              <label htmlFor="meal-cal" className="form-label">
                Kalori (kkal) <span className="req">*</span>
              </label>
              <input
                id="meal-cal"
                type="number"
                name="calories"
                value={formData.calories}
                onChange={handleFormChange}
                min="0"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="meal-pro" className="form-label">
                Protein (gram)
              </label>
              <input
                id="meal-pro"
                type="number"
                step="0.5"
                name="protein"
                value={formData.protein}
                onChange={handleFormChange}
                min="0"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="meal-crb" className="form-label">
                Karbohidrat (gram)
              </label>
              <input
                id="meal-crb"
                type="number"
                step="0.5"
                name="carbs"
                value={formData.carbs}
                onChange={handleFormChange}
                min="0"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="meal-fat" className="form-label">
                Lemak (gram)
              </label>
              <input
                id="meal-fat"
                type="number"
                step="0.5"
                name="fat"
                value={formData.fat}
                onChange={handleFormChange}
                min="0"
                className="form-input"
              />
            </div>
          </div>
        </div>

        {/* Description & Ingredients */}
        <div className="card-box">
          <div className="form-group">
            <label htmlFor="meal-desc" className="form-label">
              Catatan &amp; Deskripsi
            </label>
            <textarea
              id="meal-desc"
              name="description"
              value={formData.description}
              onChange={handleFormChange}
              rows={3}
              placeholder="Catatan rasa, keunggulan gizi, atau tips penyajian..."
              className="form-textarea"
            />
          </div>

          <div className="form-fieldset" style={{ marginTop: '20px' }}>
            <div className="fieldset-header">
              <label className="form-label">Bahan &amp; Takaran</label>
              <button
                type="button"
                className="btn btn--outline btn--sm"
                onClick={addIngredient}
              >
                <Plus size={14} /> Tambah Bahan
              </button>
            </div>

            <div className="multi-rows">
              {ingredients.map((ing, i) => (
                <div key={i} className="multi-row">
                  <input
                    type="text"
                    placeholder="Nama bahan (cth: Beras Merah, Telur)"
                    value={ing.name}
                    onChange={(e) => handleIngredientChange(i, 'name', e.target.value)}
                    className="form-input"
                  />
                  <input
                    type="text"
                    placeholder="Takaran (cth: 100g, 1 butir)"
                    value={ing.quantity}
                    onChange={(e) => handleIngredientChange(i, 'quantity', e.target.value)}
                    className="form-input"
                  />
                  <button
                    type="button"
                    className="btn btn--danger-ghost"
                    onClick={() => removeIngredient(i)}
                    disabled={ingredients.length <= 1}
                    title="Hapus baris"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions-bar">
          <button
            type="button"
            className="btn btn--outline"
            onClick={onBack}
            disabled={creating}
          >
            Batal
          </button>
          <button type="submit" className="btn btn--primary" disabled={creating}>
            {creating ? (
              <>
                <Loader size={18} className="spin" /> Menyimpan Menu…
              </>
            ) : (
              'Simpan ke Katalog'
            )}
          </button>
        </div>
      </form>

      {/* Restore Draft Modal */}
      <ConfirmModal
        open={showDraftModal}
        title="Lanjutkan Draf Sebelumnya?"
        message={`Ditemukan draf tersimpan dari ${
          draftTimestamp ? formatDraftTime(draftTimestamp) : 'sebelumnya'
        }. Apakah Anda ingin melanjutkan draf tersebut?`}
        confirmLabel="Muat Draf"
        cancelLabel="Buang"
        onConfirm={handleLoadDraft}
        onCancel={handleDiscardDraft}
      />
    </div>
  )
}
