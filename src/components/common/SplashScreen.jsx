import { useState, useEffect, useCallback, useRef } from 'react'
import { ArrowRight, Sparkles } from 'lucide-react'
import './SplashScreen.css'

/**
 * SplashScreen — Signature intro animation for NutriPlan PWA.
 */
export default function SplashScreen({ onFinish, duration = 3200 }) {
  const [isFading, setIsFading] = useState(false)
  const dismissedRef = useRef(false)

  const handleDismiss = useCallback(() => {
    if (dismissedRef.current) return
    dismissedRef.current = true
    setIsFading(true)
    setTimeout(() => {
      if (onFinish) onFinish()
    }, 500)
  }, [onFinish])

  useEffect(() => {
    const timer = setTimeout(() => {
      handleDismiss()
    }, duration)

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
        handleDismiss()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [duration, handleDismiss])

  return (
    <main
      className={`splash-overlay ${isFading ? 'splash-overlay--fading' : ''}`}
      id="splash"
      role="dialog"
      aria-modal="true"
      aria-label="NutriPlan Intro"
    >
      <div className="splash-ambient-bg" />

      {/* Emblem & Logo Glow */}
      <div className="splash-center">
        <div className="splash-icon-wrapper">
          <img
            className="splash-logo-img"
            src="/icon.svg"
            alt="NutriPlan Logo"
            width="120"
            height="120"
          />
          <div className="splash-pulse-ring" />
        </div>

        <div className="splash-brand-group">
          <div className="splash-title-wrap">
            <h1 className="splash-app-name">NutriPlan</h1>
            <Sparkles size={20} className="splash-sparkle" />
          </div>
          <p className="splash-tagline">MEAL PLANNER &amp; CALORIE COUNTER</p>
          <p className="splash-subtext">Rencanakan nutrisi sehat setiap hari</p>
        </div>
      </div>

      {/* Skip button */}
      <button
        type="button"
        className="splash-skip-btn"
        onClick={handleDismiss}
        aria-label="Masuk ke aplikasi"
      >
        <span>Mulai Sekarang</span>
        <ArrowRight size={14} />
      </button>
    </main>
  )
}
