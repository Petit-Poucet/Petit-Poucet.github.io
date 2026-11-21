/* Petit Poucet · Dons : service worker (notifications + offline shell) */
const CACHE = 'dons-v1';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).catch(() => {})); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin || u.pathname.endsWith('config.json')) return;
  e.respondWith(fetch(e.request).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r; }).catch(() => caches.match(e.request)));
});
self.addEventListener('push', e => {
  let msg = { title:'Nouveau don en ISK', body:'Ouvrez l\'appli pour voir le détail.' };
  try{ if (e.data) msg = Object.assign(msg, e.data.json()); }catch(err){}
  e.waitUntil(self.registration.showNotification(msg.title, { body:msg.body, icon:'icon-192.png', badge:'icon-192.png', tag:'don-isk', renotify:true, data:{ url:'./' } }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type:'window', includeUncontrolled:true }).then(list => {
    for (const c of list) if ('focus' in c) return c.focus();
    return self.clients.openWindow('./');
  }));
});
