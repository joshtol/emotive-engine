// Service Worker for caching emotive-mascot engine
// This dramatically improves repeat visit performance

const CACHE_NAME = 'emotive-mascot-v1'
const MASCOT_ENGINE = '/emotive-engine.js'

// Files to cache on service worker install
const STATIC_CACHE = [
  '/',
  MASCOT_ENGINE,
  '/favicon.svg',
  '/favicon.ico'
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets')
        return cache.addAll(STATIC_CACHE.map(url => {
          return new Request(url, { cache: 'reload' })
        }))
      })
      .catch((error) => {
        console.error('[SW] Cache installation failed:', error)
      })
  )
  self.skipWaiting() // Activate immediately
})

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name)
            return caches.delete(name)
          })
      )
    })
  )
  return self.clients.claim() // Take control immediately
})

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event

  // Only handle GET requests
  if (request.method !== 'GET') return

  // Skip Chrome extensions and dev tools
  if (request.url.includes('chrome-extension://')) return

  // Cache strategy for mascot engine: Cache first, network fallback
  if (request.url.includes(MASCOT_ENGINE)) {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            console.log('[SW] Serving mascot engine from cache')
            return cachedResponse
          }

          // Not in cache, fetch from network and cache it
          return fetch(request)
            .then((networkResponse) => {
              // Clone the response before caching
              const responseToCache = networkResponse.clone()

              caches.open(CACHE_NAME)
                .then((cache) => {
                  console.log('[SW] Caching mascot engine from network')
                  cache.put(request, responseToCache)
                })

              return networkResponse
            })
            .catch((error) => {
              console.error('[SW] Fetch failed:', error)
              throw error
            })
        })
    )
    return
  }

  // For other requests: Network first, cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache successful responses
        if (response.ok && request.url.startsWith(self.location.origin)) {
          const responseToCache = response.clone()
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(request, responseToCache)
            })
        }
        return response
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(request)
      })
  )
})

// Listen for messages from the client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }

  // Clear cache command
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((name) => caches.delete(name))
        )
      }).then(() => {
        console.log('[SW] All caches cleared')
        event.ports[0].postMessage({ success: true })
      })
    )
  }
})

console.log('[SW] Service Worker loaded')
