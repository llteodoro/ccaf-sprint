/* CCA-F Sprint · service worker
   App shell em cache. VERSION é o hash do conteúdo: qualquer mudança gera uma versão nova,
   que fica em espera até o app pedir para ativar (botão Atualizar). */
const VERSION = "ccaf-5be1fc3da1";
const ASSETS = [
  "./index.html",
  "./data-plan.js",
  "./data-q.js",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-96.png",
  "./icons/maskable-192.png",
  "./icons/maskable-512.png",
  "./icons/apple-touch-icon.png",
  "./icons/favicon-32.png",
  "./icons/favicon.svg",
  "./fonts/plex-sans-400.woff2",
  "./fonts/plex-sans-500.woff2",
  "./fonts/plex-sans-600.woff2",
  "./fonts/plex-mono-400.woff2",
  "./fonts/plex-mono-500.woff2",
  "./fonts/plex-mono-600.woff2",
  "./fonts/bricolage-opsz.woff2"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(VERSION).then(cache => cache.addAll(ASSETS.map(u => new Request(u, {cache: "reload"}))))
  );
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith("ccaf-") && k !== VERSION).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener("message", event => {
  if (event.data === "skipWaiting") self.skipWaiting();
});

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;
  if (new URL(req.url).origin !== self.location.origin) return;
  if (req.mode === "navigate") {
    event.respondWith((async () => {
      const cache = await caches.open(VERSION);
      return (await cache.match("./index.html")) || fetch(req);
    })());
    return;
  }
  event.respondWith((async () => {
    const cache = await caches.open(VERSION);
    return (await cache.match(req, {ignoreSearch: true})) || fetch(req);
  })());
});
