// Service worker do PDV — estratégia "rede primeiro":
// sempre busca a versão mais nova do site; se estiver sem internet,
// usa a última versão guardada no aparelho.
const CACHE = 'bmb-v2';

self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(nomes => Promise.all(nomes.filter(n => n !== CACHE).map(n => caches.delete(n))))
    .then(() => clients.claim())
));

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return; // só arquivos do próprio site
  e.respondWith(
    fetch(e.request).then(resp => {
      const copia = resp.clone();
      caches.open(CACHE).then(c => c.put(e.request, copia));
      return resp;
    }).catch(() => caches.match(e.request))
  );
});
