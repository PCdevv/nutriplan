// ---------------------------------------------------------------------------
// helpers.js — pure utility functions used across NutriPlan.
// ---------------------------------------------------------------------------

/**
 * Client-side text search — case-insensitive match against name and
 * description.
 */
export const matchesSearch = (item, query) => {
  if (!query) return true
  const q = query.toLowerCase()
  return (
    (item.name || '').toLowerCase().includes(q) ||
    (item.description || '').toLowerCase().includes(q) ||
    (item.category || '').toLowerCase().includes(q)
  )
}

/**
 * Client-side category filter.
 * `category` of '' or 'All' matches everything.
 */
export const matchesCategory = (item, category) => {
  if (!category || category === 'All') return true
  return (item.category || '').toLowerCase() === category.toLowerCase()
}

/**
 * Sort an array of items by a given key.
 * @param {'name'|'calories'|'protein'} key
 * @param {'asc'|'desc'} order
 */
export const sortItems = (items, key = 'name', order = 'asc') => {
  const sorted = [...items].sort((a, b) => {
    if (key === 'calories') {
      return (Number(a.calories) || 0) - (Number(b.calories) || 0)
    }
    if (key === 'protein') {
      return (Number(a.protein) || 0) - (Number(b.protein) || 0)
    }
    return String(a[key] || '').localeCompare(String(b[key] || ''))
  })
  return order === 'desc' ? sorted.reverse() : sorted
}

/**
 * Truncate a string to `max` characters, adding "…" when clipped.
 */
export const truncate = (str, max = 100) => {
  if (!str || str.length <= max) return str || ''
  return str.slice(0, max).trimEnd() + '…'
}

/**
 * Standard categories for NutriPlan
 */
export const MEAL_CATEGORIES = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snack']

/**
 * Extract unique category values from a list of items.
 * Defaults to standard categories if items empty.
 */
export const extractCategories = (items = []) => {
  if (!items || items.length === 0) return MEAL_CATEGORIES
  const set = new Set(MEAL_CATEGORIES)
  items.forEach((i) => {
    if (i.category) set.add(i.category)
  })
  return Array.from(set)
}
