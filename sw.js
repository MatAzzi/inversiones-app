const CACHE = 'inversiones-mwcvis1f'
const ARCHIVOS = ["./","manifest.webmanifest","pwa/apple-touch-icon.png","pwa/icon-192.png","pwa/icon-512.png","assets/index-CzodQ3wE.css","assets/index-B9qb_anP.js","assets/jspdf.es.min-CfQQRMex.js","assets/jspdf.plugin.autotable-81Htps2Y.js","assets/html2canvas.esm-CBrSDip1.js","assets/purify.es-BaNf_EpD.js","assets/index.es-D4d4_M2Z.js"]

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()))
})

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

// Primero la red (para recibir actualizaciones), y si no hay conexión, lo guardado en caché.
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url)
  const propio = url.origin === self.location.origin || url.hostname.startsWith('fonts.g')
  if (e.request.method !== 'GET' || !propio) return
  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res.ok) {
          const copia = res.clone()
          caches.open(CACHE).then(c => c.put(e.request, copia))
        }
        return res
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true })
        .then(r => r || (e.request.mode === 'navigate' ? caches.match('./') : Response.error())))
  )
})
