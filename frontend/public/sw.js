// Service Worker for LegalKonect - handles caching for offline support

const CACHE_VERSION = 'v1';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-${CACHE_VERSION}`;
const IMAGE_CACHE = `images-${CACHE_VERSION}`;

// Assets to cache immediately on install
const STATIC_ASSETS = [
    '/',
    '/index.html',
];

// Max items in dynamic cache
const MAX_DYNAMIC_CACHE_ITEMS = 50;
const MAX_IMAGE_CACHE_ITEMS = 100;

// R2 storage domain pattern
const R2_DOMAIN_PATTERN = /\.r2\.cloudflarestorage\.com|\.r2\.dev/;

// Install event - cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('[SW] Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((name) => {
                            return name.startsWith('static-') || 
                                   name.startsWith('dynamic-') || 
                                   name.startsWith('images-');
                        })
                        .filter((name) => {
                            return name !== STATIC_CACHE && 
                                   name !== DYNAMIC_CACHE && 
                                   name !== IMAGE_CACHE;
                        })
                        .map((name) => {
                            console.log('[SW] Deleting old cache:', name);
                            return caches.delete(name);
                        })
                );
            })
            .then(() => self.clients.claim())
    );
});

// Helper to limit cache size
async function limitCacheSize(cacheName, maxItems) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    
    if (keys.length > maxItems) {
        // Delete oldest entries (first in list)
        const keysToDelete = keys.slice(0, keys.length - maxItems);
        await Promise.all(keysToDelete.map((key) => cache.delete(key)));
    }
}

// Network-first strategy for API calls
async function networkFirst(request, cacheName) {
    try {
        const response = await fetch(request);
        
        // Cache successful responses
        if (response.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, response.clone());
            limitCacheSize(cacheName, MAX_DYNAMIC_CACHE_ITEMS);
        }
        
        return response;
    } catch {
        // Fallback to cache
        const cached = await caches.match(request);
        if (cached) {
            return cached;
        }
        
        // Return a generic error response
        return new Response(JSON.stringify({ 
            error: 'Network error', 
            offline: true 
        }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

// Cache-first strategy for images
async function cacheFirst(request, cacheName) {
    // Check cache first
    const cached = await caches.match(request);
    if (cached) {
        // Revalidate in background
        fetch(request)
            .then(async (response) => {
                if (response.ok) {
                    const cache = await caches.open(cacheName);
                    cache.put(request, response);
                }
            })
            .catch(() => {}); // Ignore errors in background refresh
        
        return cached;
    }
    
    // Fetch from network
    try {
        const response = await fetch(request);
        
        if (response.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, response.clone());
            limitCacheSize(cacheName, MAX_IMAGE_CACHE_ITEMS);
        }
        
        return response;
    } catch {
        // Return a placeholder response for failed images
        return new Response('', { status: 404 });
    }
}

// Stale-while-revalidate strategy
async function staleWhileRevalidate(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    
    // Fetch fresh data in background
    const fetchPromise = fetch(request)
        .then((response) => {
            if (response.ok) {
                cache.put(request, response.clone());
                limitCacheSize(cacheName, MAX_DYNAMIC_CACHE_ITEMS);
            }
            return response;
        })
        .catch(() => cached); // Fall back to cached if network fails
    
    // Return cached immediately, or wait for network
    return cached || fetchPromise;
}

// Fetch event handler
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Skip chrome-extension and other non-http(s) requests
    if (!url.protocol.startsWith('http')) {
        return;
    }

    // Handle R2 storage images - cache-first with long TTL
    if (R2_DOMAIN_PATTERN.test(url.hostname)) {
        event.respondWith(cacheFirst(request, IMAGE_CACHE));
        return;
    }

    // Handle API requests - network-first
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(networkFirst(request, DYNAMIC_CACHE));
        return;
    }

    // Handle static assets - stale-while-revalidate
    if (
        url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2)$/) ||
        url.pathname.startsWith('/assets/')
    ) {
        event.respondWith(staleWhileRevalidate(request, STATIC_CACHE));
        return;
    }

    // Handle navigation requests - network-first with fallback to index.html
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .catch(() => caches.match('/index.html'))
        );
        return;
    }

    // Default: network-first
    event.respondWith(networkFirst(request, DYNAMIC_CACHE));
});

// Listen for skip waiting message
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
