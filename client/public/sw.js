// Senali PWA Service Worker v3.0
const CACHE_NAME = 'senali-v3.0';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png'
];

// Install event - cache resources
self.addEventListener('install', event => {
  console.log('SW: Installing service worker v3.0');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('SW: Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('SW: Skip waiting');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean old caches
self.addEventListener('activate', event => {
  console.log('SW: Activating service worker v3.0');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('SW: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('SW: Claiming clients');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // API requests - network first with cache fallback
  if (event.request.url.includes('/api/') || event.request.url.includes('cloudfunctions.net')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cache successful API responses
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache for API requests
          return caches.match(event.request);
        })
    );
    return;
  }

  // Static resources - cache first
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        return response || fetch(event.request).then(fetchResponse => {
          // Cache the new resource
          if (fetchResponse.status === 200) {
            const responseClone = fetchResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return fetchResponse;
        });
      })
      .catch(() => {
        // Offline fallback for HTML pages
        if (event.request.headers.get('accept').includes('text/html')) {
          return caches.match('/');
        }
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', event => {
  console.log('SW: Background sync', event.tag);
  
  if (event.tag === 'chat-message') {
    event.waitUntil(syncChatMessages());
  }
});

// Push notifications
self.addEventListener('push', event => {
  console.log('SW: Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'New message from Senali',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'open',
        title: 'Open App',
        icon: '/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icon-192x192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Senali', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', event => {
  console.log('SW: Notification click received');
  
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Helper functions
async function syncChatMessages() {
  try {
    // Implement chat message sync logic here
    console.log('SW: Syncing chat messages');
  } catch (error) {
    console.error('SW: Error syncing chat messages', error);
  }
}