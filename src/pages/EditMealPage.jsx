import { useState, useEffect } from 'react'
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
 * EditMealPage — Modify existing meal information.
 */
export default function EditMealPage({ meal, mealId, onBack, onSuccess }) {
  const targetId = mealId || meal?.id

  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    category: 'Lunch',
    calories: 350,
    protein: 20,
    carbs: 45,
    fat: 10,
    serving_size: '1 porsi',
    description: '',
  })

  const [currentImageUrl, setCurrentImageUrl] = useState('')
  const [imagePreview, setImagePreview] = useState(null)
  const [uploading, setUploading] = useState(false)

  const [ingredients, setIngredients] = useState([{ name: '', quantity: '' }])

  const [showDraftModal, setShowDraftModal] = useState(() =>
    targetId ? hasDraft(targetId) : false,
  )
  const [draftTimestamp, setDraftTimestamp] = useState(() =>
    targetId ? getDraftTimestamp(targetId) : null,
  )

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true)
        let data = meal
        if (!data || !data.ingredients) {
          if (targetId && !String(targetId).startsWith('m-')) {
            const res = await mealService.getMealById(targetId)
            if (res.success && res.data) data = res.data
          }
        }

        if (data) {
          setFormData({
            name: data.name || '',
            category: data.category || 'Lunch',
            calories: data.calories || 0,
            protein: data.protein || 0,
            carbs: data.carbs || 0,
            fat: data.fat || 0,
            serving_size: data.serving_size || '1 porsi',
            description: data.description || '',
          })
          setCurrentImageUrl(data.image_url || '')
          if (data.ingredients && data.ingredients.length > 0) {
            setIngredients(data.ingredients)
          } else {
            setIngredients([{ name: 'Bahan Pokok', quantity: '1 porsi' }])
          }
        }
      } catch (err) {
        setError(err.message || 'Gagal memuat data menu.')
      } finally {
        setLoading(false)
      }
    }

    if (targetId) fetchItem()
  }, [targetId, meal])

  // Draft operations
  const handleLoadDraft = () => {
    const draft = loadDraft(targetId)
    if (draft) {
      if (draft.formData) setFormData(draft.formData)
      if (draft.ingredients) setIngredients(draft.ingredients)
      if (draft.imagePreview) setImagePreview(draft.imagePreview)
      setShowDraftModal(false)
      setSuccessMsg('Draf tersimpan dipulihkan.')
      setTimeout(() => setSuccessMsg(''), 3000)
    }
  }

  const handleDiscardDraft = () => {
    deleteDraft(targetId)
    setShowDraftModal(false)
    setDraftTimestamp(null)
  }

  const handleSaveDraft = () => {
    const draftData = {
      formData,
      ingredients,
      imagePreview: imagePreview || currentImageUrl,
    }
    const saved = saveDraft(draftData, targetId)
    if (saved) {
      const ts = getDraftTimestamp(targetId)
      setDraftTimestamp(ts)
      setSuccessMsg(`Draf disimpan (${formatDraftTime(ts)})`)
      setTimeout(() => setSuccessMsg(''), 3000)
    }
  }

  // Image handling
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

    try {
      setUploading(true)
      const res = await uploadService.uploadImage(file)
      if (res.success && res.data?.url) {
        setCurrentImageUrl(res.data.url)
      }
    } catch {
      setCurrentImageUrl(localUrl)
    } finally {
      setUploading(false)
    }
  }

  // Ingredients handlers
  const handleIngredientChange = (index, field, value) => {
    setIngredients((prev) => {
      const copy = [...prev]
      copy[index] = { ...copy[index], [field]: value }
      return copy
    })
  }

  const addIngredient = () =>
    setIngredients((prev) => [...prev, { name: '', quantity: '' }])

  const removeIngredient = (index) => {
    if (ingredients.length <= 1) return
    setIngredients((prev) => prev.filter((_, i) => i !== index))
  }

  // Submit edit
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.name.trim() || formData.name.trim().length < 3) {
      setError('Nama menu minimal 3 karakter.')
      return
    }

    const payload = {
      name: formData.name.trim(),
      category: formData.category || 'Lunch',
      calories: Number(formData.calories) || 0,
      protein: Number(formData.protein) || 0,
      carbs: Number(formData.carbs) || 0,
      fat: Number(formData.fat) || 0,
      serving_size: formData.serving_size.trim() || '1 porsi',
      description: formData.description.trim(),
      image_url: imagePreview || currentImageUrl,
      ingredients: ingredients.filter((ing) => ing.name.trim()),
    }

    try {
      setUpdating(true)
      const res = await mealService.updateMeal(targetId, payload)
      if (res.success || res.data) {
        deleteDraft(targetId)
        if (onSuccess) {
          onSuccess(res.data)
        } else if (onBack) {
          onBack()
        }
      } else {
        throw new Error(res.message || 'Gagal memperbarui menu.')
      }
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan saat memperbarui menu.')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="state-box">
        <Loader size={32} className="spin text-primary" />
        <p>Memuat rincian menu makanan…</p>
      </div>
    )
  }

  return (
    <div className="form-page">
      <div className="form-head">
        <button type="button" className="detail-back" onClick={onBack}>
          <ArrowLeft size={18} /> Kembali
        </button>
        <button
          type="button"
          className="btn btn--outline btn--sm"
          onClick={handleSaveDraft}
          title="Simpan draf"
        >
          <Save size={14} /> Simpan Draf
        </button>
      </div>

      <div className="form-title-group">
        <h1 className="display">Ubah Menu Makanan</h1>
        <p className="lede">Perbarui informasi gizi dan porsi sajian.</p>
      </div>

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
        {/* Photo Section */}
        <div className="card-box">
          <h2 className="card-box-title">Foto Makanan</h2>
          <div className="edit-img-wrap">
            <img
              src={imagePreview || currentImageUrl}
              alt="Foto menu"
              className="edit-current-img"
            />
            <div className="edit-img-controls">
              <input
                id="edit-meal-photo"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleImageChange}
                className="hidden-file-input"
              />
              <label htmlFor="edit-meal-photo" className="btn btn--outline btn--sm">
                <Upload size={14} /> Pilih Foto Baru
              </label>
              {uploading && (
                <span className="upload-sub-text">
                  <Loader size={12} className="spin" /> Mengunggah foto…
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Basic Details */}
        <div className="card-box">
          <h2 className="card-box-title">Informasi Utama</h2>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="edit-name" className="form-label">
                Nama Makanan <span className="req">*</span>
              </label>
              <input
                id="edit-name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="edit-cat" className="form-label">
                Kategori Waktu Makan <span className="req">*</span>
              </label>
              <select
                id="edit-cat"
                value={formData.category}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, category: e.target.value }))
                }
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
            <label htmlFor="edit-serving" className="form-label">
              Ukuran Porsi Standar
            </label>
            <input
              id="edit-serving"
              type="text"
              value={formData.serving_size}
              onChange={(e) =>
                setFormData((p) => ({ ...p, serving_size: e.target.value }))
              }
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
              <label htmlFor="edit-cal" className="form-label">
                Kalori (kkal) <span className="req">*</span>
              </label>
              <input
                id="edit-cal"
                type="number"
                value={formData.calories}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, calories: e.target.value }))
                }
                min="0"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="edit-pro" className="form-label">
                Protein (g)
              </label>
              <input
                id="edit-pro"
                type="number"
                step="0.5"
                value={formData.protein}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, protein: e.target.value }))
                }
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="edit-crb" className="form-label">
                Karbohidrat (g)
              </label>
              <input
                id="edit-crb"
                type="number"
                step="0.5"
                value={formData.carbs}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, carbs: e.target.value }))
                }
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="edit-fat" className="form-label">
                Lemak (g)
              </label>
              <input
                id="edit-fat"
                type="number"
                step="0.5"
                value={formData.fat}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, fat: e.target.value }))
                }
                className="form-input"
              />
            </div>
          </div>
        </div>

        {/* Description & Ingredients */}
        <div className="card-box">
          <div className="form-group">
            <label htmlFor="edit-desc" className="form-label">
              Catatan &amp; Deskripsi
            </label>
            <textarea
              id="edit-desc"
              value={formData.description}
              onChange={(e) =>
                setFormData((p) => ({ ...p, description: e.target.value }))
              }
              rows={3}
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
                    value={ing.name}
                    onChange={(e) => handleIngredientChange(i, 'name', e.target.value)}
                    className="form-input"
                  />
                  <input
                    type="text"
                    value={ing.quantity}
                    onChange={(e) =>
                      handleIngredientChange(i, 'quantity', e.target.value)
                    }
                    className="form-input"
                  />
                  <button
                    type="button"
                    className="btn btn--danger-ghost"
                    onClick={() => removeIngredient(i)}
                    disabled={ingredients.length <= 1}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="form-actions-bar">
          <button
            type="button"
            className="btn btn--outline"
            onClick={onBack}
            disabled={updating}
          >
            Batal
          </button>
          <button type="submit" className="btn btn--primary" disabled={updating}>
            {updating ? (
              <>
                <Loader size={18} className="spin" /> Memperbarui…
              </>
            ) : (
              'Simpan Perubahan'
            )}
          </button>
        </div>
      </form>

      {/* Restore Draft Modal */}
      <ConfirmModal
        open={showDraftModal}
        title="Pulihkan Draf Perubahan?"
        message={`Ditemukan draf dari ${
          draftTimestamp ? formatDraftTime(draftTimestamp) : 'sebelumnya'
        }. Apakah ingin memulihkan?`}
        confirmLabel="Pulihkan"
        cancelLabel="Buang"
        onConfirm={handleLoadDraft}
        onCancel={handleDiscardDraft}
      />
    </div>
  )
}
