// Service Worker for offline capabilities
const CACHE_NAME = 'ats-analyzer-v1';
const OFFLINE_URL = '/offline.html';

// Resources to cache for offline functionality
const STATIC_CACHE_URLS = [
  '/',
  '/ats',
  '/offline.html',
  '/favicon.ico',
  '/logo.svg',
  '/manifest.json'
];

// API cache configuration
const API_CACHE_CONFIG = {
  maxAge: 5 * 60 * 1000, // 5 minutes
  maxEntries: 50
};

// Install event - cache static resources
self.addEventListener('install', (event) => {
  console.log('Service Worker: Install event');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static resources');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        console.log('Service Worker: Skip waiting');
        self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Cache failed', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activate event');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Claiming clients');
        self.clients.claim();
      })
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // If successful, update cache and return response
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => cache.put(request, responseClone));
          }
          return response;
        })
        .catch(() => {
          // If offline, serve cached version or offline page
          return caches.match(request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              return caches.match(OFFLINE_URL);
            });
        })
    );
    return;
  }

  // Handle API requests with cache-first strategy for GET requests
  if (url.pathname.startsWith('/api/')) {
    if (request.method === 'GET') {
      event.respondWith(
        caches.open(CACHE_NAME)
          .then((cache) => {
            return cache.match(request)
              .then((cachedResponse) => {
                // Check if cached response is still valid
                if (cachedResponse) {
                  const cachedDate = new Date(cachedResponse.headers.get('date'));
                  const now = new Date();
                  if (now - cachedDate < API_CACHE_CONFIG.maxAge) {
                    console.log('Service Worker: Serving from cache', request.url);
                    return cachedResponse;
                  }
                }

                // Fetch fresh data
                return fetch(request)
                  .then((response) => {
                    if (response.ok) {
                      const responseClone = response.clone();
                      cache.put(request, responseClone);
                    }
                    return response;
                  })
                  .catch(() => {
                    // If offline and we have cached data, serve it
                    if (cachedResponse) {
                      console.log('Service Worker: Serving stale cache (offline)', request.url);
                      return cachedResponse;
                    }
                    // Return a custom offline response for API calls
                    return new Response(
                      JSON.stringify({
                        error: 'Offline',
                        message: 'This feature requires an internet connection'
                      }),
                      {
                        status: 503,
                        headers: { 'Content-Type': 'application/json' }
                      }
                    );
                  });
              });
          })
      );
      return;
    }
  }

  // Handle static assets with cache-first strategy
  if (request.destination === 'image' || 
      request.destination === 'script' || 
      request.destination === 'style' ||
      request.destination === 'font') {
    
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          return fetch(request)
            .then((response) => {
              if (response.ok) {
                const responseClone = response.clone();
                caches.open(CACHE_NAME)
                  .then((cache) => cache.put(request, responseClone));
              }
              return response;
            });
        })
    );
    return;
  }

  // For all other requests, use network-first strategy
  event.respondWith(
    fetch(request)
      .catch(() => {
        return caches.match(request);
      })
  );
});

// Background sync for failed requests
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync', event.tag);
  
  if (event.tag === 'retry-api-request') {
    event.waitUntil(
      // Retry failed API requests when back online
      retryFailedRequests()
    );
  }
});

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received', event);
  
  const options = {
    body: event.data ? event.data.text() : 'New notification',
    icon: '/logo.svg',
    badge: '/logo.svg',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/logo.svg'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/logo.svg'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('ATS Analyzer', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification click', event);
  
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/ats')
    );
  }
});

// Helper function to retry failed requests
async function retryFailedRequests() {
  try {
    // Get failed requests from IndexedDB or localStorage
    // This would require implementing a queue system for failed requests
    console.log('Service Worker: Retrying failed requests');
    
    // Example implementation would go here
    // You could store failed requests and retry them when online
    
  } catch (error) {
    console.error('Service Worker: Error retrying requests', error);
  }
}

// Message handling from main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then((cache) => cache.addAll(event.data.urls))
    );
  }
});

// Periodic background sync (if supported)
if ('periodicsync' in self.registration) {
  self.addEventListener('periodicsync', (event) => {
    console.log('Service Worker: Periodic sync', event.tag);
    
    if (event.tag === 'cleanup-cache') {
      event.waitUntil(cleanupCache());
    }
  });
}

// Helper function to cleanup old cache entries
async function cleanupCache() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const keys = await cache.keys();
    
    // Remove entries beyond maxEntries limit
    if (keys.length > API_CACHE_CONFIG.maxEntries) {
      const entriesToDelete = keys.slice(0, keys.length - API_CACHE_CONFIG.maxEntries);
      await Promise.all(entriesToDelete.map(key => cache.delete(key)));
    }
    
    console.log('Service Worker: Cache cleanup completed');
  } catch (error) {
    console.error('Service Worker: Cache cleanup failed', error);
  }
}
