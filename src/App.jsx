import { useState } from 'react'
import BottomNav from './components/BottomNav.jsx'
import MealPlanPage from './pages/MealPlanPage.jsx'
import FoodCatalog from './pages/FoodCatalog.jsx'
import FavoritesPage from './pages/FavoritesPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import AddMealPage from './pages/AddMealPage.jsx'
import EditMealPage from './pages/EditMealPage.jsx'
import MealDetail from './components/meal/MealDetail.jsx'
import About from './pages/About.jsx'
import PWABadge from './components/PWABadge.jsx'
import SplashScreen from './components/common/SplashScreen.jsx'
import { useMealPlan } from './hooks/useMealPlan.js'
import './App.css'

function App() {
  const [showSplash, setShowSplash] = useState(true)
  const [tab, setTab] = useState('Planner') // 'Planner' | 'Foods' | 'Favorites' | 'Profile' | 'About'
  const [mode, setMode] = useState('list') // 'list' | 'create' | 'edit' | 'detail'
  const [selectedMeal, setSelectedMeal] = useState(null)
  const [editingMeal, setEditingMeal] = useState(null)
  const [catalogCategory, setCatalogCategory] = useState('All')

  // Central Meal Plan State
  const mealPlanState = useMealPlan()

  // Navigation handler
  const handleNavigate = (target, payload) => {
    if (target === 'Create') {
      setMode('create')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (target === 'Edit') {
      setEditingMeal(payload)
      setMode('edit')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else if (target === 'Detail') {
      setSelectedMeal(payload)
      setMode('detail')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      // Tab change
      setTab(target)
      setMode('list')
      setSelectedMeal(null)
      setEditingMeal(null)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleBackToList = () => {
    setMode('list')
    setSelectedMeal(null)
    setEditingMeal(null)
  }

  // Quick action from Planner to Catalog with specific section/category
  const handlePlannerGoToCatalog = (categoryName) => {
    setCatalogCategory(categoryName || 'All')
    setTab('Foods')
    setMode('list')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Direct add to plan from Catalog or Favorites
  const handleAddToPlan = async (meal, mealType, servings, targetDate) => {
    if (targetDate && targetDate !== mealPlanState.selectedDate) {
      mealPlanState.setSelectedDate(targetDate)
    }
    return mealPlanState.addMealToPlan(meal, mealType, servings)
  }

  return (
    <div className="shell">
      {showSplash && (
        <SplashScreen onFinish={() => setShowSplash(false)} />
      )}

      {/* Minimal Top App Bar */}
      <header className="top-app-bar">
        <button
          type="button"
          className="top-brand"
          onClick={() => handleNavigate('Planner')}
        >
          <div className="top-logo-badge">
            <img src="/logo.png" alt="NutriPlan Logo" />
          </div>
          <span className="top-brand-text">NutriPlan</span>
        </button>

        <div className="top-actions">
          {tab !== 'About' && (
            <button
              type="button"
              className="btn btn--outline btn--sm"
              onClick={() => handleNavigate('About')}
            >
              Tentang
            </button>
          )}

          <button
            type="button"
            className="btn btn--primary btn--sm"
            onClick={() => handleNavigate('Create')}
            title="Tambah menu makanan baru"
          >
            ＋ Menu Baru
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="main">
        {/* Sub-page Views */}
        {mode === 'create' && (
          <AddMealPage
            onBack={handleBackToList}
            onSuccess={() => {
              handleBackToList()
              setTab('Foods')
            }}
          />
        )}

        {mode === 'edit' && (
          <EditMealPage
            meal={editingMeal}
            mealId={editingMeal?.id}
            onBack={handleBackToList}
            onSuccess={() => {
              handleBackToList()
              setTab('Foods')
            }}
          />
        )}

        {mode === 'detail' && selectedMeal && (
          <MealDetail
            meal={selectedMeal}
            onBack={handleBackToList}
            onAddToPlan={(m, type, servings) => handleAddToPlan(m, type, servings)}
            onEdit={(m) => handleNavigate('Edit', m)}
          />
        )}

        {/* Top-level Tabs */}
        {mode === 'list' && (
          <>
            {tab === 'Planner' && (
              <MealPlanPage
                mealPlanState={mealPlanState}
                onNavigateToCatalog={handlePlannerGoToCatalog}
              />
            )}

            {tab === 'Foods' && (
              <FoodCatalog
                initialCategory={catalogCategory}
                onNavigate={(dest, payload) => handleNavigate(dest, payload)}
                onAddToPlan={handleAddToPlan}
              />
            )}

            {tab === 'Favorites' && (
              <FavoritesPage
                onSelectMeal={(m) => handleNavigate('Detail', m)}
                onNavigateCatalog={() => setTab('Foods')}
                onAddToPlan={handleAddToPlan}
              />
            )}

            {tab === 'Profile' && (
              <ProfilePage onReplaySplash={() => setShowSplash(true)} />
            )}

            {tab === 'About' && <About />}
          </>
        )}
      </main>

      {/* Bottom Navigation Bar */}
      <BottomNav
        activeTab={mode === 'list' ? tab : ''}
        onTabChange={(newTab) => handleNavigate(newTab)}
      />

      <PWABadge />
    </div>
  )
}

export default App
