const CACHE_VERSION = "v2";
const INVADERS_CACHE = `geo-invaders-invaders-${CACHE_VERSION}`;
const IMAGE_CACHE = `geo-invaders-images-${CACHE_VERSION}`;
const MAP_CACHE = `geo-invaders-map-${CACHE_VERSION}`;
const APP_SHELL_CACHE = `geo-invaders-shell-${CACHE_VERSION}`;
const ALL_CACHES = [INVADERS_CACHE, IMAGE_CACHE, MAP_CACHE, APP_SHELL_CACHE];
const MAP_CACHE_MAX_ENTRIES = 250;

const INVADERS_JSON_URL =
    "https://corsmirror.com/v1?url=https://pnote.eu/projects/invaders/map/invaders.json";

const IMAGE_URL_PREFIXES = [
    "https://raw.githubusercontent.com/CAAAB/download_files/refs/heads/main/images/",
    "https://www.invader-spotter.art/grosplan/",
];

self.addEventListener("install", () => {
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((keys) =>
                Promise.all(
                    keys
                        .filter((key) => !ALL_CACHES.includes(key))
                        .map((key) => caches.delete(key)),
                ),
            )
            .then(() => self.clients.claim()),
    );
});

self.addEventListener("fetch", (event) => {
    if (event.request.method !== "GET") {
        return;
    }

    const { url } = event.request;
    const requestUrl = new URL(url);

    if (url === INVADERS_JSON_URL) {
        event.respondWith(staleWhileRevalidate(event.request, INVADERS_CACHE));
    } else if (IMAGE_URL_PREFIXES.some((prefix) => url.startsWith(prefix))) {
        event.respondWith(cacheFirst(event.request, IMAGE_CACHE));
    } else if (requestUrl.hostname === "api.maptiler.com") {
        event.respondWith(staleWhileRevalidate(event.request, MAP_CACHE, true));
    } else if (event.request.mode === "navigate") {
        event.respondWith(networkFirst(event.request, APP_SHELL_CACHE));
    }
});

async function staleWhileRevalidate(request, cacheName, enforceLimit = false) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);

    const fetchPromise = fetch(request)
        .then((response) => {
            if (response.ok || response.type === "opaque") {
                cache.put(request, response.clone());
                if (enforceLimit) {
                    trimCache(cacheName, MAP_CACHE_MAX_ENTRIES);
                }
            }
            return response;
        })
        .catch(() => cached);

    return (
        cached ||
        fetchPromise ||
        new Response(null, { status: 503, statusText: "Service Unavailable" })
    );
}

async function cacheFirst(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);

    if (cached) {
        return cached;
    }

    const response = await fetch(request);
    if (response.ok || response.type === "opaque") {
        cache.put(request, response.clone());
    }
    return response;
}

async function networkFirst(request, cacheName) {
    const cache = await caches.open(cacheName);

    try {
        const response = await fetch(request);
        if (response.ok) {
            cache.put(request, response.clone());
        }
        return response;
    } catch {
        const cached = await cache.match(request);
        return (
            cached ||
            new Response("Offline", {
                status: 503,
                statusText: "Service Unavailable",
                headers: { "Content-Type": "text/plain" },
            })
        );
    }
}

async function trimCache(cacheName, maxEntries) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();

    if (keys.length <= maxEntries) {
        return;
    }

    await Promise.all(
        keys.slice(0, keys.length - maxEntries).map((key) => cache.delete(key)),
    );
}
