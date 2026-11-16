import { useState, useEffect } from 'react'
import { Download, WifiOff, X } from 'lucide-react'

/**
 * PWABadge — Progressive Web App installation prompt & offline status indicator.
 */
export default function PWABadge() {
  const [installPrompt, setInstallPrompt] = useState(null)
  const [isOffline, setIsOffline] = useState(!navigator.onLine)
  const [installed, setInstalled] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault()
      setInstallPrompt(e)
    }

    const handleAppInstalled = () => {
      setInstalled(true)
      setInstallPrompt(null)
    }

    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    window.addEventListener('appinstalled', handleAppInstalled)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
      window.removeEventListener('appinstalled', handleAppInstalled)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!installPrompt) return
    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') {
      setInstalled(true)
    }
    setInstallPrompt(null)
  }

  if (dismissed) return null

  // Offline status banner
  if (isOffline) {
    return (
      <aside className="pwa-badge pwa-badge--offline" role="status" aria-live="polite">
        <WifiOff size={16} />
        <span>Mode Offline aktif. Rencana makan &amp; kalori tersimpan di perangkat.</span>
      </aside>
    )
  }

  // Install PWA banner
  if (installPrompt && !installed) {
    return (
      <aside className="pwa-badge" role="region" aria-label="Install Aplikasi">
        <div className="pwa-badge-content">
          <Download size={16} className="text-primary" />
          <span>Pasang <strong>NutriPlan</strong> di ponsel untuk akses offline cepat.</span>
        </div>
        <div className="pwa-badge-actions">
          <button
            type="button"
            className="btn btn--primary btn--sm"
            onClick={handleInstallClick}
          >
            Instal PWA
          </button>
          <button
            type="button"
            className="icon-btn"
            onClick={() => setDismissed(true)}
            aria-label="Tutup pemberitahuan"
          >
            <X size={14} />
          </button>
        </div>
      </aside>
    )
  }

  return null
}
