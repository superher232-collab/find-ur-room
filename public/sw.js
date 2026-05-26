const CACHE_NAME = 'find-ur-room-v1'
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.json',
  '/data/building-graph.json',
  '/maps/lantai2.png',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
]

// Install Event: Pre-cache core shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching core assets...')
      return cache.addAll(ASSETS_TO_CACHE)
    }).then(() => self.skipWaiting())
  )
})

// Activate Event: Clear older caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache:', key)
            return caches.delete(key)
          }
        })
      )
    }).then(() => self.clients.claim())
  )
})

// Fetch Event: Network-first falling back to Cache strategy
self.addEventListener('fetch', (event) => {
  // Only handle standard HTTP/S requests (avoid chrome-extension or local dev WebSockets)
  if (!event.request.url.startsWith(self.location.origin) && !event.request.url.startsWith('https://')) {
    return
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // If response is valid, clone and save to cache dynamically
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache)
          })
        }
        return networkResponse
      })
      .catch(() => {
        // If network request fails (Offline Mode), serve from cache
        console.log('[Service Worker] Serving offline from cache:', event.request.url)
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse
          }
          
          // Fallback if offline and asset not in cache
          if (event.request.headers.get('accept').includes('text/html')) {
            return caches.match('/')
          }
        })
      })
  )
})
