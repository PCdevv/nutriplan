import { useState, useMemo } from 'react'
import {
  Plus,
  RefreshCw,
  Loader,
  AlertCircle,
  UtensilsCrossed,
  CalendarPlus,
  Check,
  X,
} from 'lucide-react'
import { useMeals } from '../hooks/useMeals'
import MEALS_LOCAL from '../data/meals'
import MealCard from '../components/meal/MealCard'
import MealDetail from '../components/meal/MealDetail'
import AdvancedFilter from '../components/common/AdvancedFilter'
import ConfirmModal from '../components/modals/ConfirmModal'
import mealService from '../services/mealService'
import {
  matchesSearch,
  matchesCategory,
  sortItems,
  extractCategories,
} from '../utils/helpers'
import { getTodayDateString } from '../utils/calorieUtils'

/**
 * FoodCatalog — Meal & recipe catalog with filtering, sorting, and direct meal planner integration.
 */
export default function FoodCatalog({
  onNavigate,
  onAddToPlan,
  initialCategory = 'All',
}) {
  const { meals: apiMeals, loading, error, refetch } = useMeals({ limit: 100 })
  const [useLocal, setUseLocal] = useState(false)

  // Master items list
  const rawMeals = useMemo(() => {
    if (useLocal || (error && apiMeals.length === 0)) {
      return MEALS_LOCAL
    }
    return apiMeals.length > 0 ? apiMeals : MEALS_LOCAL
  }, [apiMeals, error, useLocal])

  // Filter & sort states
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState(initialCategory || 'All')
  const [sortKey, setSortKey] = useState('name')
  const [sortOrder, setSortOrder] = useState('asc')

  const categories = useMemo(() => extractCategories(rawMeals), [rawMeals])

  const filteredMeals = useMemo(() => {
    const matched = rawMeals.filter(
      (m) => matchesSearch(m, search) && matchesCategory(m, activeCategory),
    )
    return sortItems(matched, sortKey, sortOrder)
  }, [rawMeals, search, activeCategory, sortKey, sortOrder])

  // Detail view state
  const [selectedMeal, setSelectedMeal] = useState(null)

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  // Quick "Add to Plan" Modal State
  const [planningMeal, setPlanningMeal] = useState(null)
  const [planDate, setPlanDate] = useState(getTodayDateString())
  const [planType, setPlanType] = useState('lunch')
  const [planServings, setPlanServings] = useState(1)
  const [planSuccess, setPlanSuccess] = useState(false)

  const handleOpenPlanModal = (meal) => {
    setPlanningMeal(meal)
    setPlanType((meal.category || 'lunch').toLowerCase())
    setPlanServings(1)
    setPlanSuccess(false)
  }

  const handleConfirmAddToPlan = async () => {
    if (!planningMeal || !onAddToPlan) return
    const success = await onAddToPlan(planningMeal, planType, planServings, planDate)
    if (success) {
      setPlanSuccess(true)
      setTimeout(() => {
        setPlanningMeal(null)
        setPlanSuccess(false)
      }, 1000)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      setDeleting(true)
      setDeleteError('')
      await mealService.deleteMeal(deleteTarget.id)
      setDeleteTarget(null)
      refetch()
    } catch (err) {
      setDeleteError(err.message || 'Gagal menghapus menu.')
    } finally {
      setDeleting(false)
    }
  }

  // If viewing single detail
  if (selectedMeal) {
    return (
      <MealDetail
        meal={selectedMeal}
        onBack={() => setSelectedMeal(null)}
        onAddToPlan={(m, type, s) => {
          if (onAddToPlan) onAddToPlan(m, type, s)
        }}
        onEdit={(m) => onNavigate && onNavigate('Edit', m)}
        onDelete={(m) => {
          setSelectedMeal(null)
          setDeleteTarget(m)
        }}
      />
    )
  }

  return (
    <div className="catalog-page">
      {/* Masthead */}
      <section className="masthead">
        <h1 className="display">Katalog Menu &amp; Nutrisi</h1>
        <p className="lede">
          Koleksi hidangan sehat lengkap dengan rincian kalori dan makronutrisi.
          Pilih dan rencanakan konsumsi harianmu.
        </p>
      </section>

      {/* List controls */}
      <div className="list-head">
        <div>
          <h2>Daftar Menu</h2>
          <span className="count">
            {filteredMeals.length} hidangan tersedia
          </span>
        </div>

        {onNavigate && (
          <button
            type="button"
            className="btn btn--primary btn--sm"
            onClick={() => onNavigate('Create')}
          >
            <Plus size={16} /> Buat Menu Baru
          </button>
        )}
      </div>

      {/* Filters */}
      <AdvancedFilter
        search={search}
        onSearch={setSearch}
        categories={categories}
        activeCategory={activeCategory}
        onCategory={setActiveCategory}
        sortKey={sortKey}
        sortOrder={sortOrder}
        onSort={({ key, order }) => {
          setSortKey(key)
          setSortOrder(order)
        }}
      />

      {/* State Boxes */}
      {loading && apiMeals.length === 0 && (
        <div className="state-box">
          <Loader size={28} className="spin text-primary" />
          <p>Memuat katalog hidangan…</p>
        </div>
      )}

      {!loading && error && !useLocal && apiMeals.length === 0 && (
        <div className="state-box state-box--error">
          <AlertCircle size={28} />
          <p>{error}</p>
          <div className="state-box__actions">
            <button type="button" className="btn btn--outline" onClick={refetch}>
              <RefreshCw size={16} /> Coba Lagi
            </button>
            <button
              type="button"
              className="btn btn--outline"
              onClick={() => setUseLocal(true)}
            >
              Lihat Menu Lokal
            </button>
          </div>
        </div>
      )}

      {!loading && filteredMeals.length === 0 && (
        <div className="state-box">
          <UtensilsCrossed size={32} className="text-secondary" />
          <p>Tidak ada hidangan yang cocok dengan pencarian Anda.</p>
        </div>
      )}

      {/* Grid of meals */}
      {filteredMeals.length > 0 && (
        <ul className="meal-grid">
          {filteredMeals.map((meal) => (
            <MealCard
              key={meal.id || meal.name}
              meal={meal}
              onSelect={setSelectedMeal}
              onAddToPlan={() => handleOpenPlanModal(meal)}
              onEdit={onNavigate ? (m) => onNavigate('Edit', m) : undefined}
              onDelete={setDeleteTarget}
            />
          ))}
        </ul>
      )}

      {useLocal && (
        <p className="local-notice">
          Menampilkan katalog lokal perangkat.{' '}
          <button
            type="button"
            className="link-btn"
            onClick={() => {
              setUseLocal(false)
              refetch()
            }}
          >
            Hubungkan server
          </button>
        </p>
      )}

      {/* Delete confirmation */}
      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Hapus Menu Makanan"
        message={`Apakah Anda yakin ingin menghapus "${deleteTarget?.name}" dari katalog? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => {
          setDeleteTarget(null)
          setDeleteError('')
        }}
      />
      {deleteError && <div className="toast toast--error">{deleteError}</div>}

      {/* Quick Add To Plan Modal */}
      {planningMeal && (
        <div className="modal-backdrop" onClick={() => setPlanningMeal(null)}>
          <div
            className="modal-box modal-box--plan"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="plan-modal-head">
              <div className="plan-modal-title-row">
                <CalendarPlus size={22} className="text-primary" />
                <div>
                  <h3 className="modal-title">Rencanakan Menu</h3>
                  <span className="plan-modal-sub">{planningMeal.name}</span>
                </div>
              </div>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setPlanningMeal(null)}
                aria-label="Tutup modal"
              >
                <X size={16} />
              </button>
            </div>

            <div className="plan-modal-body">
              <div className="form-group">
                <label className="form-label">Tanggal Konsumsi</label>
                <input
                  type="date"
                  value={planDate}
                  onChange={(e) => setPlanDate(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Waktu Makan</label>
                  <select
                    value={planType}
                    onChange={(e) => setPlanType(e.target.value)}
                    className="form-select"
                  >
                    <option value="breakfast">Sarapan</option>
                    <option value="lunch">Makan Siang</option>
                    <option value="dinner">Makan Malam</option>
                    <option value="snack">Cemilan</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Jumlah Porsi</label>
                  <select
                    value={planServings}
                    onChange={(e) => setPlanServings(Number(e.target.value))}
                    className="form-select"
                  >
                    <option value="0.5">0.5 Porsi</option>
                    <option value="1">1 Porsi</option>
                    <option value="1.5">1.5 Porsi</option>
                    <option value="2">2 Porsi</option>
                    <option value="3">3 Porsi</option>
                  </select>
                </div>
              </div>

              <div className="plan-modal-summary">
                <span>Total Kalori:</span>
                <strong>
                  {Math.round((planningMeal.calories || 0) * planServings)} kkal
                </strong>
              </div>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn--outline"
                onClick={() => setPlanningMeal(null)}
              >
                Batal
              </button>
              <button
                type="button"
                className="btn btn--primary"
                onClick={handleConfirmAddToPlan}
              >
                {planSuccess ? (
                  <>
                    <Check size={16} /> Ditambahkan!
                  </>
                ) : (
                  'Simpan ke Jadwal'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
