import { Search, SlidersHorizontal } from 'lucide-react'

/**
 * AdvancedFilter — Search input + Category pills + Sorting options.
 */
export default function AdvancedFilter({
  search,
  onSearch,
  categories,
  activeCategory,
  onCategory,
  sortKey,
  sortOrder,
  onSort,
}) {
  return (
    <div className="adv-filter">
      {/* Search Bar */}
      <div className="adv-filter__search">
        <Search size={16} className="adv-filter__icon" />
        <input
          type="search"
          placeholder="Cari menu, bahan, atau kalori…"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          className="adv-filter__input"
          aria-label="Cari menu makanan"
        />
      </div>

      {/* Category Pills */}
      <div className="adv-filter__pills">
        {categories.map((cat) => {
          const isActive = activeCategory === cat

          return (
            <button
              key={cat}
              type="button"
              className={`pill ${isActive ? 'pill--active' : ''}`}
              onClick={() => onCategory(cat)}
            >
              {cat === 'All' ? 'Semua Kategori' : cat}
            </button>
          )
        })}
      </div>

      {/* Sort selection */}
      <div className="adv-filter__sort">
        <SlidersHorizontal size={14} />
        <span className="sort-label">Urutkan:</span>
        <select
          value={`${sortKey}_${sortOrder}`}
          onChange={(e) => {
            const [key, order] = e.target.value.split('_')
            onSort({ key, order })
          }}
          aria-label="Urutkan menu makanan"
          className="adv-filter__select"
        >
          <option value="name_asc">Nama (A → Z)</option>
          <option value="name_desc">Nama (Z → A)</option>
          <option value="calories_asc">Kalori: Rendah → Tinggi</option>
          <option value="calories_desc">Kalori: Tinggi → Rendah</option>
          <option value="protein_desc">Protein Tertinggi</option>
        </select>
      </div>
    </div>
  )
}
