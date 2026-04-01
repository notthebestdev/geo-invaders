const CACHE_NAME = "geo-invaders-v1";

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
                        .filter((key) => key !== CACHE_NAME)
                        .map((key) => caches.delete(key)),
                ),
            )
            .then(() => self.clients.claim()),
    );
});

self.addEventListener("fetch", (event) => {
    const { url } = event.request;

    if (url === INVADERS_JSON_URL) {
        event.respondWith(staleWhileRevalidate(event.request));
    } else if (IMAGE_URL_PREFIXES.some((prefix) => url.startsWith(prefix))) {
        event.respondWith(cacheFirst(event.request));
    }
});

async function staleWhileRevalidate(request) {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);

    const fetchPromise = fetch(request)
        .then((response) => {
            if (response.ok) {
                cache.put(request, response.clone());
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

async function cacheFirst(request) {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);

    if (cached) {
        return cached;
    }

    const response = await fetch(request);
    if (response.ok) {
        cache.put(request, response.clone());
    }
    return response;
}
