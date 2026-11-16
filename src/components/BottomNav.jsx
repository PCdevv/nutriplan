import { CalendarDays, UtensilsCrossed, Heart, User } from 'lucide-react'
import { useFavorites } from '../hooks/useFavorites'

/**
 * BottomNav — Fixed modern bottom navigation bar for mobile PWA experience.
 *
 * @param {Object} props
 * @param {string} props.activeTab - 'Planner' | 'Foods' | 'Favorites' | 'Profile'
 * @param {Function} props.onTabChange - (tabId) => void
 */
export default function BottomNav({ activeTab, onTabChange }) {
  const { favorites } = useFavorites()
  const favCount = favorites ? favorites.length : 0

  const navItems = [
    { id: 'Planner', label: 'Planner', icon: CalendarDays },
    { id: 'Foods', label: 'Katalog', icon: UtensilsCrossed },
    { id: 'Favorites', label: 'Favorit', icon: Heart, badge: favCount },
    { id: 'Profile', label: 'Profil', icon: User },
  ]

  return (
    <nav className="bottom-nav" aria-label="Navigasi Utama">
      <div className="bottom-nav__container">
        {navItems.map((item) => {
          const IconComponent = item.icon
          const isActive = activeTab === item.id

          return (
            <button
              key={item.id}
              type="button"
              className={`bottom-nav__item ${isActive ? 'bottom-nav__item--active' : ''}`}
              onClick={() => onTabChange(item.id)}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="bottom-nav__icon-wrap">
                <IconComponent size={22} className="bottom-nav__icon" />
                {Boolean(item.badge && item.badge > 0) && (
                  <span className="bottom-nav__badge">{item.badge}</span>
                )}
              </div>
              <span className="bottom-nav__label">{item.label}</span>
              {isActive && <div className="bottom-nav__indicator" />}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
