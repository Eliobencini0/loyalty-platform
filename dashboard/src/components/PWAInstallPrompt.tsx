import { useState, useEffect } from 'react'
import { usePWAInstall } from '../hooks/usePWAInstall'

type PWAInstallPromptMode = 'home' | 'menu'

interface PWAInstallPromptProps {
  mode?: PWAInstallPromptMode
}

const HOME_DISMISS_KEY = 'pwa_home_dismissed_at'
const HOME_DISMISS_COUNT_KEY = 'pwa_home_dismiss_count'
const MENU_DISMISS_KEY = 'pwa_menu_dismissed'
const INSTALL_DISMISS_KEY = 'pwa_permanently_dismissed'
const HOME_DISMISS_COOLDOWN_MS = 3 * 24 * 60 * 60 * 1000
const HOME_MAX_DISMISS_COUNT = 3

export function PWAInstallPrompt({ mode = 'home' }: PWAInstallPromptProps) {
  const { isInstallable, isInstalled, install } = usePWAInstall()
  const [dismissed, setDismissed] = useState(false)
  const [isDismissing, setIsDismissing] = useState(false)
  const [isInstalling, setIsInstalling] = useState(false)
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
  const iconSrc = `${import.meta.env.BASE_URL}icons/icon-192.png`
  const debugForcePrompt =
    new URLSearchParams(window.location.search).get('debugPwaPrompt') === '1' ||
    localStorage.getItem('debug_pwa_prompt') === 'true'

  useEffect(() => {
    if (mode === 'menu') {
      setDismissed(sessionStorage.getItem(MENU_DISMISS_KEY) === 'true')
      return
    }

    const lastDismissedAt = Number(localStorage.getItem(HOME_DISMISS_KEY) || '0')
    const dismissCount = Number(localStorage.getItem(HOME_DISMISS_COUNT_KEY) || '0')
    const reachedDisplayLimit = dismissCount >= HOME_MAX_DISMISS_COUNT
    const withinCooldown =
      Number.isFinite(lastDismissedAt) &&
      lastDismissedAt > 0 &&
      Date.now() - lastDismissedAt < HOME_DISMISS_COOLDOWN_MS

    setDismissed(reachedDisplayLimit || withinCooldown)
  }, [mode])

  const handleInstall = async () => {
    setIsInstalling(true)
    const success = await install()
    setIsInstalling(false)

    if (success) {
      console.log('PWA installed successfully')
      localStorage.setItem(INSTALL_DISMISS_KEY, 'true')

      setIsDismissing(true)
      setTimeout(() => {
        setDismissed(true)
      }, 300)
    }
  }

  const handleDismiss = () => {
    setIsDismissing(true)
    setTimeout(() => {
      setDismissed(true)

      if (mode === 'menu') {
        sessionStorage.setItem(MENU_DISMISS_KEY, 'true')
      } else {
        localStorage.setItem(HOME_DISMISS_KEY, String(Date.now()))
        const dismissCount = Number(localStorage.getItem(HOME_DISMISS_COUNT_KEY) || '0')
        localStorage.setItem(HOME_DISMISS_COUNT_KEY, String(dismissCount + 1))
      }
    }, 300)
  }

  // Don't show if already installed
  if (isInstalled) {
    return null
  }

  // Don't show if permanently dismissed (after install)
  if (localStorage.getItem(INSTALL_DISMISS_KEY) === 'true') {
    return null
  }

  // Don't show if dismissed (unless it's session 3+)
  if (dismissed) {
    return null
  }

  // On non-iOS browsers we need the deferred install prompt to be available.
  if (!isIOS && !isInstallable && !debugForcePrompt) {
    return null
  }

  if (isIOS) {
    return (
      <div
        className={`pwa-install-prompt expressive ${isDismissing ? 'dismissing' : ''}`}
        role="banner"
        aria-live="polite"
        aria-label="Install Progressive Web App prompt"
      >
        <button
          onClick={handleDismiss}
          className="pwa-prompt-dismiss"
          aria-label="Dismiss install prompt"
          type="button"
        >
          <span className="material-symbols-outlined" aria-hidden="true">close</span>
        </button>

        <div className="pwa-prompt-header">
          <div className="pwa-prompt-icon">
            <img src={iconSrc} alt="" aria-hidden="true" />
          </div>
          <h3 id="pwa-prompt-title" className="pwa-prompt-title">Install Loyalty Platform</h3>
        </div>

        <p id="pwa-prompt-description" className="pwa-prompt-description">
          Tap <strong>Share</strong> icon, then <strong>"Add to Home Screen"</strong>
        </p>
      </div>
    )
  }

  return (
    <div
      className={`pwa-install-prompt expressive ${isDismissing ? 'dismissing' : ''}`}
      role="banner"
      aria-live="polite"
      aria-label="Install Progressive Web App prompt"
    >
      <button
        onClick={handleDismiss}
        className="pwa-prompt-dismiss"
        aria-label="Dismiss install prompt"
        type="button"
      >
        <span className="material-symbols-outlined" aria-hidden="true">close</span>
      </button>

      <div className="pwa-prompt-header">
        <div className="pwa-prompt-icon">
          <img src={iconSrc} alt="" aria-hidden="true" />
        </div>
        <h3 id="pwa-prompt-title" className="pwa-prompt-title">Install Loyalty Platform</h3>
      </div>

      <p id="pwa-prompt-description" className="pwa-prompt-description">
        {debugForcePrompt && !isInstallable
          ? 'Debug preview mode for the install banner'
          : 'Get faster access, offline support, and instant notifications'}
      </p>

      <button
        onClick={handleInstall}
        className="btn-primary btn-expressive pwa-install-button"
        disabled={isInstalling}
        aria-describedby="pwa-prompt-title pwa-prompt-description"
        type="button"
      >
        {isInstalling ? (
          <>
            <span className="pwa-spinner" aria-hidden="true"></span>
            Installing...
          </>
        ) : (
          <>
            <span className="material-symbols-outlined" aria-hidden="true">install_mobile</span>
            Install
          </>
        )}
      </button>
    </div>
  )
}
