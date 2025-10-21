'use client'

import { useEffect } from 'react'

/**
 * Service Worker Registration Component
 * Caches mascot engine for instant loading on repeat visits
 *
 * Benefits:
 * - First visit: Normal load (~500ms)
 * - Repeat visits: Instant from cache (~50ms)
 * - Works offline
 */
export default function ServiceWorkerRegistration() {
  useEffect(() => {
    // Only register in production and if service workers are supported
    if (
      typeof window === 'undefined' ||
      !('serviceWorker' in navigator) ||
      process.env.NODE_ENV === 'development'
    ) {
      return
    }

    const registerServiceWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        })

        console.log('[SW] Service Worker registered:', registration.scope)

        // Check for updates periodically
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing

          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New version available
                console.log('[SW] New version available, refresh to update')

                // Optionally show update notification to user
                if (confirm('New version available! Reload to update?')) {
                  newWorker.postMessage({ type: 'SKIP_WAITING' })
                  window.location.reload()
                }
              }
            })
          }
        })

        // Listen for controller change (new SW activated)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('[SW] Controller changed, reloading page')
          window.location.reload()
        })

      } catch (error) {
        console.error('[SW] Service Worker registration failed:', error)
      }
    }

    registerServiceWorker()

    // Cleanup function
    return () => {
      // Unregister on unmount (optional, usually not needed)
      // navigator.serviceWorker.getRegistration().then(reg => reg?.unregister())
    }
  }, [])

  // This component doesn't render anything
  return null
}
