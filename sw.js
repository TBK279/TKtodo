// TKtodo Service Worker
// 目的：安装成 app 后，每次启动都向服务器要最新页面，不再被系统缓存卡住。
// 策略：导航请求 = 网络优先（no-store），失败才用缓存（离线兜底）。

const CACHE = 'tktodo-v1';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  if (event.request.mode !== 'navigate') return;

  event.respondWith((async () => {
    const key = self.registration.scope;
    try {
      const res = await fetch(event.request, { cache: 'no-store' });
      try {
        const cache = await caches.open(CACHE);
        await cache.put(key, res.clone());
      } catch (e) {}
      return res;
    } catch (err) {
      const cached = await caches.match(key);
      return cached || Response.error();
    }
  })());
});
